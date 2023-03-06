const log = require("@ui5/logger").getLogger("server:custommiddleware:cfdestination")

const fs = require("fs")
const path = require("path")

const approuter = require("@sap/approuter")()

const proxy = require("express-http-proxy")
const ct = require("content-type")
const mime = require("mime-types")
const portfinder = require("portfinder")

/**
 * Determines the applications base path from the given resource collection.
 *
 * <b>ATTENTION: this is a hack to be compatible with UI5 tooling 2.x and 3.x</b>
 *
 * @param {module:@ui5/fs.AbstractReader} collection Reader or Collection to read resources of the root project and its dependencies
 * @returns {string} application base path
 */
const determineAppBasePath = (collection) => {
	let appBasePath
	if (collection?._readers) {
		for (const _reader of collection._readers) {
			appBasePath = determineAppBasePath(_reader)
			if (appBasePath) break
		}
	}
	if (collection?._project?._type === "application") {
		appBasePath = collection._project._modulePath // UI5 tooling 3.x
	} else if (collection?._project?.type === "application") {
		appBasePath = collection._project.path // UI5 tooling 2.x
	} else if (typeof collection?._fsBasePath === "string") {
		appBasePath = collection._fsBasePath
	}
	return appBasePath
}

/**
 * Returns the next free port coming from the basePort.
 *
 * @param {number} basePort the base port coming from
 * @returns {number} a port which is free
 */
const nextFreePort = async (basePort) => {
	try {
		portfinder.basePort = basePort
		return await portfinder.getPortPromise()
	} catch {
		return basePort
	}
}

/**
 * Custom UI5 Server middleware "cfdestination"
 *
 * @param {object} parameters Parameters
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @returns {Function} Middleware function to use
 */
module.exports = async ({ resources, options, middlewareUtil }) => {
	// provide a set of default runtime options
	const effectiveOptions = {
		debug: false,
		port: 5000,
		xsappJson: "./xs-app.json",
		destinations: [],
		allowServices: false,
		authenticationMethod: "none",
		allowLocalDir: false,
		subdomain: null,
		limit: "10mb",
		rewriteContent: true,
		rewriteContentTypes: ["application/json", "application/atom+xml", "application/xml"]
	}
	// config-time options from ui5.yaml for cfdestination take precedence
	if (options.configuration) {
		Object.assign(effectiveOptions, options.configuration)
	}

	//request.debug = effectiveOptions.debug // pass debug flag on to underlying request lib
	process.env.XS_APP_LOG_LEVEL = effectiveOptions.debug ? "DEBUG" : "ERROR"
	// read in the cf config file (TODO: verify better possibility to retrieve the base path of the root project from tooling)
	const fsBasePath = determineAppBasePath(resources?.rootProject)
	const xsappPath = fsBasePath || process.cwd() // respect cwd of containing ui5 server
	const _xsappJson = path.resolve(xsappPath, effectiveOptions.xsappJson)
	const xsappConfig = JSON.parse(fs.readFileSync(_xsappJson, "utf-8"))

	// the default auth mechanism is set to none but the user can pass an auth method using the options
	xsappConfig.authenticationMethod = effectiveOptions.authenticationMethod

	// req-use app-router with config file to run in "shadow" mode
	process.env.destinations = JSON.stringify(effectiveOptions.destinations || [])
	let destinations
	if (effectiveOptions.debug && process.env.destinations.length === 0) {
		log.info(`Provided destinations are empty`)
		destinations = []
	} else {
		destinations = JSON.parse(process.env.destinations)
	}

	const routes = []
	// default: ignore routes that point to web apps as they are already hosted by the ui5 tooling,
	// but allow overwriting this behavior via "allowLocalDir"
	xsappConfig.routes = xsappConfig.routes.filter(
		(route) =>
			(effectiveOptions.allowLocalDir || !route.localDir) && (effectiveOptions.allowServices || !route.service)
	)

	xsappConfig.routes.forEach((route) => {
		/* Authentication type should come from route if authenticationMethod is set to "route", otherwise set to "none" */
		if (xsappConfig.authenticationMethod.toLowerCase() === "none") {
			route.authenticationType = "none"
		}

		// ignore /-redirects (e.g. "^/(.*)")
		// a source declaration such as "^/backend/(.*)$" is needed
		const routeMatch = route.source.match(/[^/]*\/(.*\/)?[^/]*/)
		if (routeMatch) {
			routes.push({
				...route,
				re: new RegExp(route.source),
				path: routeMatch[1],
				url: destinations.find((destination) => destination.name === route.destination)?.url
			})
			effectiveOptions.debug
				? log.info(
						`adding cf-like destination "${
							route.destination || "(xs-app.json specific setting)"
						}" proxying reqs to ${route.source}`
				  )
				: null
		}
	})

	const freePort = await nextFreePort(effectiveOptions.port)
	if (freePort != effectiveOptions.port) {
		log.info(`Port ${effectiveOptions.port} already in use! Using next free port: ${freePort} for the AppRouter...`)
	}

	approuter.start({
		port: freePort,
		xsappConfig: xsappConfig,
		workingDir: xsappPath || "."
	})

	let baseUri
	if (effectiveOptions.subdomain) {
		// subdomain of the subscribed tenant in multitenancy context
		baseUri = `http://${effectiveOptions.subdomain}.localhost:${freePort}`
	} else {
		baseUri = `http://localhost:${freePort}`
	}

	const getMimeInfo = (reqPath, headers) => {
		const ctHeader = Object.keys(headers).find((header) => /content-type/i.test(header))
		if (ctHeader) {
			const parsedCtHeader = ct.parse(headers[ctHeader])
			const contentType = parsedCtHeader?.type || "application/octet-stream"
			const charset = parsedCtHeader?.parameters?.charset || mime.charset(contentType)
			return {
				contentType,
				charset
			}
		} else {
			return middlewareUtil.getMimeInfo(reqPath)
		}
	}

	return proxy(baseUri, {
		https: false,
		limit: effectiveOptions.limit,
		filter: (req /*, res*/) => {
			const reqPath = middlewareUtil.getPathname(req)
			return routes.some((route) => route.re.test(reqPath))
		},
		proxyReqOptDecorator: (proxyReqOpts /*, originalReq*/) => {
			// remove the accept encoding header to get a plain response
			const aeHeader = Object.keys(proxyReqOpts.headers).find((header) => /accept-encoding/i.test(header))
			proxyReqOpts.headers[aeHeader] = ""
			return proxyReqOpts
		},
		userResDecorator: (proxyRes, proxyResData, userReq /*, userRes*/) => {
			const reqPath = middlewareUtil.getPathname(userReq)
			let { contentType, charset } = getMimeInfo(reqPath, proxyRes.headers)
			// sometimes the content type isn't defined, so we correct it
			if (!proxyRes.headers["content-type"]) {
				proxyRes.headers["content-type"] = contentType
			}
			// only rewrite content when enabled and the content type is supported!
			if (
				effectiveOptions.rewriteContent &&
				effectiveOptions.rewriteContentTypes.indexOf(contentType?.toLowerCase()) >= 0
			) {
				let data = proxyResData.toString(charset || "utf-8")
				const route = routes.find((route) => route.re.test(reqPath))
				const url = `${userReq.protocol}://${userReq.get("host")}/${route.path}`
				data = data.replaceAll(route.url, url)
				// in some cases, the odata servers respond http instead of https in the content
				if (route.url?.startsWith("https://")) {
					data = data.replaceAll(`http://${route.url.substr(8)}`, url)
				}
				return data
			} else {
				return proxyResData
			}
		}
	})
}

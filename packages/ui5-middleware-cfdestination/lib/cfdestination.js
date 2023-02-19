const log = require("@ui5/logger").getLogger("server:custommiddleware:cfdestination")

const fs = require("fs")
const path = require("path")

const approuter = require("@sap/approuter")()

const contentType = require("content-type")

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
module.exports = ({ resources, options, middlewareUtil }) => {
	// provide a set of default runtime options
	const effectiveOptions = {
		debug: false,
		port: 5000,
		xsappJson: "./xs-app.json",
		destinations: [],
		allowServices: false,
		authenticationMethod: "none",
		allowLocalDir: false,
		subdomain: null
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
	const xsappConfig = JSON.parse(fs.readFileSync(_xsappJson, "utf8"))

	// the default auth mechanism is set to none but the user can pass an auth method using the options
	xsappConfig.authenticationMethod = effectiveOptions.authenticationMethod

	let regExes = []
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

		// ignore /-redirects (e.g. "^/(.*)"
		// a source declaration such as "^/backend/(.*)$" is needed
		if (route.source.match(/.*\/.*\/?.*/)) {
			regExes.push(new RegExp(route.source))
			effectiveOptions.debug
				? log.info(
						`adding cf-like destination "${
							route.destination || "(xs-app.json specific setting)"
						}" proxying reqs to ${route.source}`
				  )
				: null
		}
	})

	// req-use app-router with config file to run in "shadow" mode
	process.env.destinations = JSON.stringify(effectiveOptions.destinations || [])
	if (effectiveOptions.debug && process.env.destinations.length === 0) {
		log.info(`Provided destinations are empty`)
	}

	approuter.start({
		port: effectiveOptions.port,
		xsappConfig: xsappConfig,
		workingDir: xsappPath || "."
	})

	let baseUrl
	if (effectiveOptions.subdomain) {
		// subdomain of the subscribed tenant in multitenancy context
		baseUrl = `http://${effectiveOptions.subdomain}.localhost:${effectiveOptions.port}`
	} else {
		baseUrl = `http://localhost:${effectiveOptions.port}`
	}

	return async (req, res, next) => {
		const reqPath = middlewareUtil.getPathname(req)
		if (/get/i.test(req.method) && regExes.some((re) => re.test(reqPath))) {
			const url = `${baseUrl}${req.originalUrl}`
			effectiveOptions.debug ? log.info(`proxying ${req.method} ${req.originalUrl} to ${url}...`) : null
			log.info(`proxying ${req.method} ${req.originalUrl} to ${url}...`)

			const fetch = (await import("node-fetch")).default
			const response = await fetch(url, {
				headers: req.headers
				//redirect: "manual",
			})

			const responseHeaders = response.headers.raw()
			const headers = {}
			Object.keys(responseHeaders)
				.filter((name) => !/(content-encoding|transfer-encoding|content-length)/i.test(name))
				.forEach((name) => (headers[name] = responseHeaders[name]))
			const text = await response.text()
			const ct = Array.isArray(headers["content-type"])
				? contentType.parse(headers["content-type"][0])
				: undefined
			res.writeHead(response.status, response.statusText, headers)
			res.end(text, ct?.parameters?.["charset"])

			return
		}

		next()
	}
}

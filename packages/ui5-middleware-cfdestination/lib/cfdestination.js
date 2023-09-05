const fs = require("fs")
const path = require("path")

const approuter = require("@sap/approuter")()

const { createProxyMiddleware, responseInterceptor } = require("http-proxy-middleware")
const ct = require("content-type")
const mime = require("mime-types")
const portfinder = require("portfinder")
const dotenv = require("dotenv")
dotenv.config()

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
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @returns {Function} Middleware function to use
 */
module.exports = async ({ log, options, middlewareUtil }) => {
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
		rewriteContent: true,
		rewriteContentTypes: ["application/json", "application/atom+xml", "application/xml"],
		appendAuthRoute: false,
		disableWelcomeFile: false,
		enableWebSocket: false
	}
	// config-time options from ui5.yaml for cfdestination take precedence
	if (options.configuration) {
		Object.assign(effectiveOptions, options.configuration)
	}

	// set the log level for the approuter
	process.env.XS_APP_LOG_LEVEL = process.env.XS_APP_LOG_LEVEL || effectiveOptions.debug ? "DEBUG" : "ERROR"

	// read in the cf config file from the root path
	const xsappPath = middlewareUtil.getProject().getRootPath() || process.cwd()
	const _xsappJson = path.resolve(xsappPath, effectiveOptions.xsappJson)
	const xsappConfig = JSON.parse(fs.readFileSync(_xsappJson, "utf8"))

	// when running ui5 serve, we may not want to redirect /
	if (effectiveOptions.disableWelcomeFile) {
		delete xsappConfig.welcomeFile
	}

	// the default auth mechanism is set to none but the user can pass an auth method using the options
	xsappConfig.authenticationMethod = effectiveOptions.authenticationMethod

	// check if destinations exist in .env file as JSON string
	if (typeof effectiveOptions.destinations === "string" && effectiveOptions.destinations.startsWith("$env:")) {
		const destinationsEnvKey = effectiveOptions.destinations.substring(5).trim()
		if (destinationsEnvKey && destinationsEnvKey in process.env) {
			try {
				effectiveOptions.destinations = JSON.parse(process.env[destinationsEnvKey])
			} catch (error) {
				throw new Error(`No valid destinations JSON in .env file at '${destinationsEnvKey}': ${error}`)
			}
		} else {
			throw new Error(`No variable for 'destinations' with name '${destinationsEnvKey}' found in process.env!`)
		}
	}
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

	// add the route for all html/htm pages to support XSUAA login (if needed)
	if (effectiveOptions.appendAuthRoute && effectiveOptions.authenticationMethod !== "none") {
		const relativeSourcePath = path.relative(
			middlewareUtil.getProject().getRootPath(),
			middlewareUtil.getProject().getSourcePath()
		)
		xsappConfig.routes.push({
			source: "^/([^.]+\\.html?(?:\\?.*)?)$",
			localDir: relativeSourcePath,
			target: "$1",
			cacheControl: "no-store",
			authenticationType: "xsuaa"
		})
	}

	xsappConfig.routes.forEach((route) => {
		// Authentication type should come from route if authenticationMethod is set to "route", otherwise set to "none"
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

	// determine the next free port
	const freePort = await nextFreePort(effectiveOptions.port)
	if (freePort != effectiveOptions.port) {
		log.info(`Port ${effectiveOptions.port} already in use! Using next free port: ${freePort} for the AppRouter...`)
	}

	// start the approuter with the custom config
	approuter.start({
		port: freePort,
		xsappConfig: xsappConfig,
		workingDir: xsappPath
	})

	// determine base uri based on subdomain info
	let baseUri
	if (effectiveOptions.subdomain) {
		// subdomain of the subscribed tenant in multitenancy context
		baseUri = `http://${effectiveOptions.subdomain}.localhost:${freePort}`
	} else {
		baseUri = `http://localhost:${freePort}`
	}

	// define custom routes to be also handled by the approuter, e.g. login and logout
	// callbacks or the welcome file redirect of the approuter itself
	const customRoutes = [xsappConfig?.login?.callbackEndpoint || "/login/callback"]
	if (!effectiveOptions.disableWelcomeFile) {
		customRoutes.unshift("/")
	}
	if (xsappConfig?.logout?.logoutEndpoint) {
		customRoutes.push(xsappConfig.logout.logoutEndpoint)
	}

	// filter function to determine which routes should be proxied to the approuter
	const filter = (pathname /*, req */) => {
		return (
			customRoutes.some((customRoute) => new RegExp(`^${customRoute}(\\?.*)?$`).test(pathname)) ||
			routes.some((route) => route.re.test(pathname))
		)
	}

	// helper to determine the mime info either from the req path or if provided
	// we parse the content-type value and return the mime info
	const getMimeInfo = (reqPath, ctValue) => {
		let mimeInfo = {}
		if (ctValue) {
			const parsedCtHeader = ct.parse(ctValue)
			const type = parsedCtHeader?.type || "application/octet-stream"
			const charset = parsedCtHeader?.parameters?.charset || mime.charset(type)
			const contentType = ct.format({ type, parameters: parsedCtHeader?.parameters })
			Object.assign(mimeInfo, { type, charset, contentType })
		} else {
			Object.assign(mimeInfo, middlewareUtil.getMimeInfo(reqPath))
		}
		return mimeInfo
	}

	// intereceptor of the response to update the content-type and rewrite the content
	const intercept = responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
		const reqPath = middlewareUtil.getPathname(req)
		effectiveOptions.debug && log.info(`${req.method} ${reqPath} -> ${baseUri}${reqPath} [${proxyRes.statusCode}]`)

		// determine and update content type (avoid no content type!)
		let { type, charset, contentType } = getMimeInfo(reqPath, proxyRes.headers["content-type"])
		res.setHeader("content-type", contentType)

		// only rewrite content when enabled and the content type is supported!
		if (effectiveOptions.rewriteContent && effectiveOptions.rewriteContentTypes.indexOf(type?.toLowerCase()) >= 0) {
			let data = responseBuffer.toString(charset || "utf8")
			const route = routes.find((route) => route.re.test(reqPath))
			// use the referrer or fallback to xfwd information to calculate the URL
			const referrer =
				req.headers.referrer ||
				req.headers.referer ||
				`${req.headers["x-forwarded-proto"]}://${req.headers["x-forwarded-host"]}${req.baseUrl}`
			const url = new URL(route.path, referrer).toString()
			data = data.replaceAll(route.url, url)
			// in some cases, the odata servers respond http instead of https in the content
			if (route.url?.startsWith("https://")) {
				data = data.replaceAll(`http://${route.url.substr(8)}`, url)
			}
			return new Buffer.from(data)
		} else {
			return responseBuffer
		}
	})

	// the proxy middleware (based on https://www.npmjs.com/package/http-proxy-middleware)
	return createProxyMiddleware(filter, {
		logLevel: effectiveOptions.debug ? "info" : "warn",
		target: baseUri,
		changeOrigin: true, // for vhosted sites
		selfHandleResponse: true, // res.end() will be called internally by responseInterceptor()
		autoRewrite: true, // rewrites the location host/port on (301/302/307/308) redirects based on requested host/port
		xfwd: true, // adds x-forward headers
		ws: effectiveOptions.enableWebSocket, // enable websocket support
		onProxyReq: (proxyReq, req, res) => {
			// if the ui5-middleware-index is used and redirects the welcome file
			// we need to send a redirect to trigger the auth-flow of the approuter
			if (req["ui5-middleware-index"]?.path === "/") {
				const reqPath = middlewareUtil.getPathname(req)
				res._redirected = true
				return res.redirect(reqPath)
			}
		},
		onProxyRes: async (proxyRes, req, res) => {
			// we only handle the response when the request hasn't been
			// redirected already in the flow above
			if (!res._redirected) {
				return intercept(proxyRes, req, res)
			}
		}
	})
}

const fs = require("fs")
const path = require("path")

const approuter = require("@sap/approuter")()

const hook = require("ui5-utils-express/lib/hook")
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
		enableWebSocket: false,
		extensions: []
	}
	// config-time options from ui5.yaml for cfdestination take precedence
	if (options.configuration) {
		Object.assign(effectiveOptions, options.configuration)
	}

	// whitelist all localhost requests
	process.env.WS_ALLOWED_ORIGINS = process.env.WS_ALLOWED_ORIGINS || JSON.stringify([{ host: "localhost" }])

	// set the log level for the approuter
	process.env.XS_APP_LOG_LEVEL = process.env.XS_APP_LOG_LEVEL || effectiveOptions.debug ? "DEBUG" : "ERROR"

	// read in the cf config file from the root path
	const rootPath = middlewareUtil.getProject().getRootPath() || process.cwd()
	const _xsappJson = path.resolve(rootPath, effectiveOptions.xsappJson)
	const xsappConfig = JSON.parse(fs.readFileSync(_xsappJson, "utf8"))

	// when running ui5 serve, we may not want to redirect /
	if (effectiveOptions.disableWelcomeFile) {
		delete xsappConfig.welcomeFile
	}

	// detect enableWebSocket from xs-app.json (if enableWebSocket has not been provided)
	if (options.configuration?.enableWebSocket == null) {
		effectiveOptions.enableWebSocket = xsappConfig.websockets?.enabled || false
	}

	// the default auth mechanism is set to none but the user can pass an auth method using the options
	xsappConfig.authenticationMethod = effectiveOptions.authenticationMethod

	// extract destinations information
	//   1.) destinations from env variable "destinations"
	//   2.) check for ui5.yaml destinations to start wit "$env" and extract from that env variable
	//   3.) ui5.yaml to be an array of destinations configuration
	let destinations
	try {
		destinations = JSON.parse(process.env.destinations)
	} catch (ex) {
		// no destinations from environment => let's check the effectiveOptions
	}
	if (!destinations) {
		// check if destinations exist in .env file as JSON string
		if (typeof effectiveOptions.destinations === "string" && effectiveOptions.destinations.startsWith("$env:")) {
			const destinationsEnvKey = effectiveOptions.destinations.substring(5).trim()
			if (destinationsEnvKey && destinationsEnvKey in process.env) {
				try {
					destinations = effectiveOptions.destinations = JSON.parse(process.env[destinationsEnvKey])
				} catch (error) {
					throw new Error(`No valid destinations JSON in .env file at '${destinationsEnvKey}': ${error}`)
				}
			} else {
				throw new Error(
					`No variable for 'destinations' with name '${destinationsEnvKey}' found in process.env!`
				)
			}
		} else if (Array.isArray(effectiveOptions.destinations)) {
			destinations = effectiveOptions.destinations
		}
	}

	// finally the destinations need to be an array,
	// so that we can serialize it to the env
	if (Array.isArray(destinations)) {
		process.env.destinations = JSON.stringify(destinations)
	}

	// determine the routes
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

	// resolve the extensions and append the paths / inject parameters into request
	//   => req["ui5-middleware-cfdestination"]?.parameters provides access to params
	const extensionsRoutes = []
	const createParametersInjector = function (middleware, parameters) {
		// we always need the injectParameters wrapper to have <= 3 arguments otherwise
		// the approuter will not call the middleware function when it has a 4th argument!
		return function injectParameters(req) {
			req["ui5-middleware-cfdestination"] = {
				parameters
			}
			return middleware.apply(this, [...arguments, parameters])
		}
	}
	const extensions = effectiveOptions.extensions
		?.map((extension) => {
			try {
				const extensionModulePath = require.resolve(extension.module, {
					paths: [rootPath]
				})
				const extensionModule = require(extensionModulePath)
				Object.keys(extensionModule?.insertMiddleware || {}).forEach((type) => {
					extensionModule.insertMiddleware[type] = extensionModule.insertMiddleware[type].map(
						(middleware) => {
							if (typeof middleware === "function") {
								// middleware function
								return createParametersInjector(middleware, extension.parameters)
							} else {
								// middleware object with path / handler
								if (middleware.path) {
									extensionsRoutes.push(middleware.path)
								}
								middleware.handler = createParametersInjector(middleware.handler, extension.parameters)
								return middleware
							}
						}
					)
				})
				return extensionModule
			} catch (ex) {
				log.warn(
					`⚠️ Failed to resolve extension "${JSON.stringify(extension)}"! The extension will be ignored...`
				)
				return undefined
			}
		})
		.filter((extension) => extension != null)

	// determine the next free port
	const freePort = await nextFreePort(effectiveOptions.port)
	if (freePort != effectiveOptions.port) {
		log.info(`Port ${effectiveOptions.port} already in use! Using next free port: ${freePort} for the AppRouter...`)
	}

	// start the approuter with the custom config
	approuter.start({
		port: freePort,
		xsappConfig: xsappConfig,
		workingDir: rootPath,
		extensions
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
	const customRoutes = [...extensionsRoutes, xsappConfig?.login?.callbackEndpoint || "/login/callback"]
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
	const getMimeInfo = (pathname, ctValue) => {
		let mimeInfo = {}
		if (ctValue) {
			const parsedCtHeader = ct.parse(ctValue)
			const type = parsedCtHeader?.type || "application/octet-stream"
			const charset = parsedCtHeader?.parameters?.charset || mime.charset(type)
			const contentType = ct.format({ type, parameters: parsedCtHeader?.parameters })
			Object.assign(mimeInfo, { type, charset, contentType })
		} else {
			Object.assign(mimeInfo, middlewareUtil.getMimeInfo(pathname))
		}
		return mimeInfo
	}

	// intereceptor of the response to update the content-type and rewrite the content
	const intercept = responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
		const url = req.url
		effectiveOptions.debug && log.info(`${req.method} ${url} -> ${baseUri}${url} [${proxyRes.statusCode}]`)

		// determine and update content type (avoid no content type!)
		const pathname = url?.match("^[^?]*")[0] // req.url
		let { type, charset, contentType } = getMimeInfo(pathname, proxyRes.headers["content-type"])
		res.setHeader("content-type", contentType)

		// only rewrite content when enabled, a route exists, and the content type is supported!
		const route = routes.find((route) => route.re.test(url))
		if (
			route &&
			effectiveOptions.rewriteContent &&
			effectiveOptions.rewriteContentTypes.indexOf(type?.toLowerCase()) >= 0
		) {
			let data = responseBuffer.toString(charset || "utf8")
			// use the referrer or fallback to xfwd information to calculate the URL
			const referrer =
				req.headers.referrer ||
				req.headers.referer ||
				`${req.headers["x-forwarded-proto"]}://${req.headers["x-forwarded-host"]}${req.baseUrl}`
			const referrerUrl = new URL(route.path, referrer).toString()
			data = data.replaceAll(route.url, referrerUrl)
			// in some cases, the odata servers respond http instead of https in the content
			if (route.url?.startsWith("https://")) {
				data = data.replaceAll(`http://${route.url.substr(8)}`, referrerUrl)
			}
			return new Buffer.from(data)
		} else {
			return responseBuffer
		}
	})

	// the proxy middleware (based on https://www.npmjs.com/package/http-proxy-middleware)
	const proxyMiddleware = createProxyMiddleware(filter, {
		logLevel: effectiveOptions.debug ? "info" : "warn",
		target: baseUri,
		changeOrigin: true, // for vhosted sites
		selfHandleResponse: true, // res.end() will be called internally by responseInterceptor()
		autoRewrite: true, // rewrites the location host/port on (301/302/307/308) redirects based on requested host/port
		xfwd: true, // adds x-forward headers
		onProxyReq: (proxyReq, req, res) => {
			// if the ui5-middleware-index is used and redirects the welcome file
			// we need to send a redirect to trigger the auth-flow of the approuter
			if (req["ui5-middleware-index"]?.url === "/") {
				// mark the response as redirected
				res["ui5-middleware-cfdestination"] = {
					redirected: true
				}
				// redirect the response to baseUrl + url
				const baseUrl = req["ui5-patched-router"]?.baseUrl || "/"
				return res.redirect(`${baseUrl !== "/" ? baseUrl : ""}${req.url}`)
			} else if (req["ui5-patched-router"]?.originalUrl) {
				proxyReq.setHeader("x-forwarded-path", req["ui5-patched-router"].originalUrl)
			}
		},
		/*
		onProxyReqWs: (proxyReq, req, socket, options, head) => {
			console.log(`${req.url}`);
		},
		*/
		onProxyRes: async (proxyRes, req, res) => {
			// we only handle the response when the request hasn't been
			// redirected already in the flow above
			if (!res["ui5-middleware-cfdestination"]?.redirected) {
				return intercept(proxyRes, req, res)
			}
		}
	})

	// manually install the upgrade function for the websocket (if configured)
	return effectiveOptions.enableWebSocket
		? hook(
				"ui5-middleware-cfdestination",
				({ on, options }) => {
					const { mountpath } = options
					on("upgrade", (req, socket, head) => {
						// only handle requests in the mountpath
						if (req.url?.startsWith(mountpath)) {
							// call the upgrade function of the proxy middleware to
							// initialize the websocket and establish the connection
							proxyMiddleware.upgrade.call(this, req, socket, head)
						}
					})
				},
				proxyMiddleware
		  )
		: proxyMiddleware
}

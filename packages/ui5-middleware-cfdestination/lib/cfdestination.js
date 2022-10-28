const log = require("@ui5/logger").getLogger("server:custommiddleware:cfdestination")

const fs = require("fs")
const path = require("path")
const request = require("request")

const approuter = require("@sap/approuter")()

/**
 * @typedef {Object} [configuration] configuration
 * @property {int|yo<number|5000>} port - port to run the underlying `approuter` on
 * @property {string|yo<input|"./xs-app.json"} [xsappJson] path to the cf-style approuter configuration file `xs-app.json`
 * @property {string} [destinations] destination name, matching the one used in routes in `xs-app.json`
 * @property {string} [url] URI to the host to "proxy" to
 * @property {boolean|yo<confirm|false>} [allowServices] allow BTP services to be used at runtime that are configured in `xs-app.json`
(requires an authenticated BTP session!)
 * @property {string|yo<input|none>} [authenticationMethod] whether to equip routes with authenticatio
* @property {boolean|yo<confirm|false>} [allowLocalDir] allow static assets to be picked up by the included `approuter`
defaults to `false` as usually all local files/assets are supposedly served by `ui5-server`
* @property {boolean|yo<confirm|false>} [debug] see output
 */

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

	request.debug = effectiveOptions.debug // pass debug flag on to underlying request lib
	process.env.XS_APP_LOG_LEVEL = effectiveOptions.debug ? "DEBUG" : "ERROR"
	// read in the cf config file
	const _xsappJson = path.resolve(resources.rootProject._readers[0]._fsBasePath, "..", effectiveOptions.xsappJson) // respect cwd of containing ui5 server
	const xsappConfig = JSON.parse(fs.readFileSync(_xsappJson, "utf8"))
	const xsappPath = _xsappJson.replace("xs-app.json", "")

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
	return (req, res, next) => {
		// check request path for match with each route.source
		// and proxy to localhost:${effectiveOptions.port}
		const reqPath = middlewareUtil.getPathname(req)
		let match = false
		let url = ""
		// eslint-disable-next-line no-unused-vars
		for (let [index, regEx] of regExes.entries()) {
			if (regEx.test(reqPath)) {
				match = true
				if (effectiveOptions.subdomain) {
					// subdomain of the subscribed tenant in multitenancy context
					url = `${req.protocol}://${effectiveOptions.subdomain}.localhost:${effectiveOptions.port}${req.originalUrl}`
				} else {
					url = `${req.protocol}://localhost:${effectiveOptions.port}${req.originalUrl}`
				}
				break
			}
		}
		if (match) {
			effectiveOptions.debug ? log.info(`proxying ${req.method} ${req.originalUrl} to ${url}...`) : null
			req.pipe(request(url)).pipe(res)
		} else {
			next()
		}
	}
}

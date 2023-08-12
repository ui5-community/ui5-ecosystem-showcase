/* eslint-disable no-unused-vars */
const path = require("path");

/**
 * Custom middleware to create the UI5 AMD-like bundles for used ES imports from node_modules.
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @param {object} parameters.options Options
 * @param {object} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {boolean} [parameters.options.configuration.skipCache] Flag whether the module cache for the bundles should be skipped
 * @param {boolean} [parameters.options.configuration.keepDynamicImports] List of NPM packages for which the dynamic imports should be kept
 * @returns {Function} Middleware function to use
 */
module.exports = function ({ log, options, middlewareUtil }) {
	const { getResource } = require("./util")(log);

	const config = options.configuration || {};
	log.verbose(`Starting ui5-tooling-modules-middleware`);

	// return the middleware
	return async (req, res, next) => {
		// determine the request path
		const reqPath = middlewareUtil.getPathname(req);

		// perf
		const time = Date.now();

		// check for resources requests
		const match = /^\/resources\/(.*)$/.exec(reqPath);
		if (match) {
			// determine the module name (for JS resources we strip the extension)
			let moduleName = match[1];
			const ext = path.extname(moduleName);
			if (ext === ".js") {
				moduleName = moduleName.substring(0, moduleName.length - 3);
			}

			// try to resolve the resource from node_modules
			const resource = await getResource(moduleName, config);
			if (resource) {
				try {
					log.verbose(`Processing resource ${moduleName}...`);

					// determine charset and content-type
					let { contentType, charset } = middlewareUtil.getMimeInfo(reqPath);
					res.setHeader("Content-Type", contentType);

					// respond the content
					res.end(resource.code);

					log.verbose(`Processing resource ${moduleName} took ${Date.now() - time} millis`);

					// resource processed, stop the forwarding to next middleware
					return;
				} catch (err) {
					log.error(`Couldn't process resource ${moduleName}: ${err}`);
				}
			}
		}

		// forward to the next middlware
		next();
	};
};

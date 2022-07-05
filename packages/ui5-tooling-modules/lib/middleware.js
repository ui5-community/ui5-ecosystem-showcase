"use strict";

/* eslint-disable no-unused-vars */
const log = require("@ui5/logger").getLogger("server:custommiddleware:ui5-tooling-modules");

const path = require("path");
const { getResource } = require("./util");

/**
 * @typedef {Object} [configuration] configuration
 * @property {boolean|yo<confirm:false>} [verbose] Enables verbose logging (default to `false`)
 * @property {boolean|yo<confirm:false>} [prependPathMappings] Prepends the path mappings for the UI5 loader to the `Component.js` which allows to run the Component using 3rd party libs in e.g. Fiori launchpad environments (default to `false`)
 */
/**
 * Custom middleware to create the UI5 AMD-like bundles for used ES imports from node_modules.
 *
 * @param {object} parameters Parameters
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @param {object} parameters.options Options
 * @param {object} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {boolean} [parameters.options.configuration.skipCache] Flag whether the module cache for the bundles should be skipped
 * @returns {Function} Middleware function to use
 */
module.exports = function ({ resources, options, middlewareUtil }) {
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
					res.end(resource);

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

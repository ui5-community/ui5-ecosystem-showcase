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
 * @param {boolean|string[]} [parameters.options.keepDynamicImports] List of NPM packages for which the dynamic imports should be kept or boolean (defaults to true)
 * @returns {Function} Middleware function to use
 */
module.exports = function ({ log, options, middlewareUtil }) {
	const cwd = middlewareUtil.getProject().getRootPath() || process.cwd();
	const depPaths = middlewareUtil
		.getDependencies()
		.map((dep) => middlewareUtil.getProject(dep))
		.filter((prj) => !prj.isFrameworkProject())
		.map((prj) => prj.getRootPath());
	const { getResource } = require("./util")(log);

	const config = options.configuration || {};
	log.verbose(`Starting ui5-tooling-modules-middleware`);

	// extract the configuration of files to be skipped during transformation
	let skipTransform = options?.configuration?.skipTransform || false;

	// merge the skipTransform configuration from the dependencies if not skipping
	// the transformation of the whole project (usage of boolean values are overruling!)
	if (skipTransform !== true) {
		middlewareUtil.getDependencies().forEach((dep) => {
			const customConfig = middlewareUtil.getProject(dep).getCustomConfiguration();
			const customSkipTransform = customConfig?.["ui5-tooling-modules"]?.skipTransform;
			if (Array.isArray(customSkipTransform)) {
				if (!skipTransform) {
					skipTransform = [];
				}
				(skipTransform || []).push(...customSkipTransform);
				log.verbose(`The dependency "${dep}" provides the following "skipTransform" configuration: "${customSkipTransform.join(", ")}"`);
			} else if (typeof customSkipTransform === "boolean") {
				log.warn(`The dependency "${dep}" defines "skipTransform" with a boolean value. This configuration is ignored! Pleas specify the "skipTransform" with a string[] to be considered...`);
			}
		});
	}

	// return the middleware
	return async (req, res, next) => {
		// determine the request path
		const pathname = req.url?.match("^[^?]*")[0];

		// perf
		const time = Date.now();

		// check for resources requests
		const match = /^\/resources\/(.*)$/.exec(pathname);
		if (match) {
			// determine the module name (for JS resources we strip the extension)
			let moduleName = match[1];
			const ext = path.extname(moduleName);
			if (ext === ".js") {
				moduleName = moduleName.substring(0, moduleName.length - 3);
			}

			// try to resolve the resource from node_modules
			const resource = await getResource(moduleName, config, { cwd, depPaths, skipTransform });
			if (resource) {
				try {
					log.verbose(`Processing resource ${moduleName}...`);

					// determine content-type
					let { contentType } = middlewareUtil.getMimeInfo(pathname);
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

/* eslint-disable no-unused-vars */
const path = require("path");
const { createReadStream } = require("fs");
const chokidar = require("chokidar");

/**
 * Custom middleware to create the UI5 AMD-like bundles for used ES imports from node_modules.
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {object} parameters.options Options
 * @param {object} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {boolean} [parameters.options.configuration.skipCache] Flag whether the module cache for the bundles should be skipped
 * @param {boolean|string[]} [parameters.options.keepDynamicImports] List of NPM packages for which the dynamic imports should be kept or boolean (defaults to true)
 * @returns {Function} Middleware function to use
 */
module.exports = async function ({ log, resources, options, middlewareUtil }) {
	const cwd = middlewareUtil.getProject().getRootPath() || process.cwd();
	const depPaths = middlewareUtil
		.getDependencies()
		.map((dep) => middlewareUtil.getProject(dep))
		.filter((prj) => !prj.isFrameworkProject())
		.map((prj) => prj.getRootPath());
	const { scan, getBundleInfo, getResource } = require("./util")(log);

	log.verbose(`Starting ui5-tooling-modules-middleware`);

	// derive the configuration and default values
	const config = Object.assign(
		{
			debug: false,
			skipTransform: false,
			watch: true,
		},
		options.configuration
	);
	let { debug, skipTransform, watch } = config;

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

	// logic which bundles and watches the modules coming from the
	// node_modules or dependencies via NPM package names
	const requestedModules = new Set();
	let whenBundled, bundleWatcher, scanTime, bundleTime;
	const bundleAndWatch = async ({ moduleName, force }) => {
		if (moduleName && !requestedModules.has(moduleName)) {
			requestedModules.add(moduleName);
		}
		if (force || !whenBundled) {
			// first, we need to scan for all unique dependencies
			scanTime = Date.now();
			whenBundled = scan(resources.rootProject, config, { cwd, depPaths })
				.then(({ uniqueModules }) => {
					// second, we trigger the bundling of the unique dependencies
					debug && log.info(`Scanning took ${Date.now() - scanTime} millis`);
					bundleTime = Date.now();
					const modules = Array.from(uniqueModules);
					Array.from(requestedModules)
						.filter((mod) => !uniqueModules.has(mod))
						.forEach((mod) => {
							log.warn(`Including module "${mod}" to bundle which has been requested dynamically! This module may not be packaged during the build!`);
							modules.push(mod);
						});
					return getBundleInfo(modules, config, { cwd, depPaths, isMiddleware: true });
				})
				.then((bundleInfo) => {
					// finally, we watch the entries of the bundle
					debug && log.info(`Bundling took ${Date.now() - bundleTime} millis`);
					bundleWatcher?.close();
					const globsToWatch = [cwd, ...depPaths].map((depPath) => `${depPath}/**/*.{js,ts,xml}`);
					globsToWatch.push(...bundleInfo.getResources().map((res) => res.path));
					if (debug) {
						log.info(`Watch files:`);
						globsToWatch.forEach((file) => log.info(`  - ${file}`));
					}
					if (watch) {
						bundleWatcher = chokidar
							.watch(globsToWatch, {
								ignoreInitial: true,
								ignored: [/node_modules/],
							})
							.on("change", () => bundleAndWatch({ force: true }));
					}
					return bundleInfo;
				});
		}
	};

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

			// check if the resource exists in node_modules
			let resource = await getResource(moduleName, { cwd, depPaths, isMiddleware: true });

			// if a resource has been found in node_modules, we will
			// trigger the bundling process and watch the bundled resources
			if (resource) {
				bundleAndWatch({ moduleName });
			}

			// if the resource is a bundled resource, we need to wait for it
			const bundleInfo = whenBundled && (await whenBundled);
			const bundledResource = bundleInfo?.getEntry(moduleName);
			if (bundledResource) {
				resource = bundledResource;
			}

			// serve the resource
			if (resource) {
				try {
					log.verbose(`Processing resource ${moduleName}...`);

					// determine content-type
					let { contentType } = middlewareUtil.getMimeInfo(pathname);
					res.setHeader("Content-Type", contentType);

					// respond the content
					// /!\ non-modules and resources with a path are served as stream (encoding!)
					if (resource.type === "module" || (!resource.path && resource.code)) {
						res.end(resource.code);
					} else if (resource.path) {
						const stream = createReadStream(resource.path);
						stream.pipe(res);
					}

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

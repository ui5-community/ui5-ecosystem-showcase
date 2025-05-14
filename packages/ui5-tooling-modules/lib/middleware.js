const path = require("path");
const { createReadStream, readFileSync, existsSync } = require("fs");
const chokidar = require("chokidar");
const sanitize = require("sanitize-filename");

/**
 * Determines the source paths of the given resource collection recursivly.
 *
 * <b>ATTENTION: this is a hack to be compatible with UI5 tooling 2.x and 3.x</b>
 *
 * @param {module:@ui5/fs.AbstractReader} collection Reader or Collection to read resources of the root project and its dependencies
 * @returns {string[]} source paths
 */
const determineSourcePaths = (collection) => {
	const fsPaths = [];
	collection?._readers?.forEach((_reader) => {
		fsPaths.push(...determineSourcePaths(_reader));
	});
	if (collection?._project?._type === "application") {
		fsPaths.push(path.resolve(collection._project._modulePath, collection._project._webappPath));
	} else if (typeof collection?._fsBasePath === "string") {
		fsPaths.push(collection._fsBasePath);
	}
	return fsPaths;
};

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
 * @param {boolean} [parameters.options.configuration.persistentCache] Flag whether the module cache for the bundles should be persistent
 * @param {boolean|string[]} [parameters.options.configuration.keepDynamicImports] List of NPM packages for which the dynamic imports should be kept or boolean (defaults to true)
 * @param {boolean|string} [parameters.options.configuration.dynamicEntriesPath] the relative path for dynamic entries (defaults to "_dynamics")
 * @param {boolean} [parameters.options.configuration.useRelativeModulePaths] Flag whether the modules should use relative paths instead of absolute paths (for applications)
 * @returns {Function} Middleware function to use
 */
module.exports = async function ({ log, resources, options, middlewareUtil }) {
	const project = middlewareUtil.getProject();

	log.verbose(`Starting ui5-tooling-modules-middleware`);

	// derive the configuration and default values
	const config = Object.assign(
		{
			debug: false,
			persistentCache: true,
			skipTransform: false,
			watch: true,
			watchDebounce: 100,
			entryPoints: [],
			useRelativeModulePaths: false,
			addToNamespace: true,
		},
		options.configuration,
	);
	let { debug, skipTransform, watch, watchDebounce } = config;

	// derive the custom thirdparty namespace
	let thirdpartyNamespace = "thirdparty";
	if (typeof config.addToNamespace === "string") {
		thirdpartyNamespace = config.addToNamespace
			.split(/[\\/]/)
			.map(sanitize)
			.filter((s) => !/^\.*$/.test(s))
			.join("/");
		config.addToNamespace = true;
	}

	// determine the current working directory and the package.json path
	let cwd = project.getRootPath() || process.cwd();
	let pkgJsonPath = path.join(cwd, "package.json");

	// if the package.json is not in the root of the project, try to find it
	// in the npm_package_json environment variable (used by npm scripts)
	if (!existsSync(pkgJsonPath)) {
		pkgJsonPath = process.env.npm_package_json;
		cwd = path.dirname(pkgJsonPath);
	}

	// determine the project information
	const projectInfo = {
		name: project.getName(),
		version: project.getVersion(),
		namespace: project.getNamespace(),
		type: project.getType(),
		rootPath: project.getRootPath(),
		framework: {
			name: project.getFrameworkName(),
			version: project.getFrameworkVersion(),
		},
		pkgJsonPath,
		pkgJson: require(pkgJsonPath),
	};

	// determine the dependencies and their paths
	const depProjects = middlewareUtil
		.getDependencies()
		.map((dep) => middlewareUtil.getProject(dep))
		.filter((prj) => {
			// we skip the framework projects, except of we explicitly add them
			// to the additionalDependencies in the configuration as these deps
			// typically don't have dependencies in the package.json
			// (except when listed in the additionalDependencies)
			if (prj.isFrameworkProject()) {
				if (Array.isArray(config.additionalDependencies) && config.additionalDependencies.length > 0) {
					// check if the framework project is listed in the additionalDependencies
					const pkgJsonFile = path.join(prj.getRootPath(), "package.json");
					if (existsSync(pkgJsonFile)) {
						const pkgJson = JSON.parse(readFileSync(pkgJsonFile, { encoding: "utf-8" }));
						return config.additionalDependencies?.includes(pkgJson.name);
					}
				}
				return false;
			}
			return true;
		});
	const depPaths = depProjects.map((prj) => prj.getRootPath());
	const depReaderCollection = middlewareUtil.resourceFactory.createReaderCollection({
		name: `Reader collection of project ${project.getName()}`,
		readers: [resources.rootProject, ...depProjects.map((prj) => prj.getReader())],
	});

	// utility to scan the project for dependencies and resources
	const { scan, getBundleInfo, getResource, resolveModule } = require("./util")(log, projectInfo);

	// should we watch the files?
	let onChangeCallback;
	let watcher;
	if (watch) {
		const pathsToWatch = Array.isArray(watch) ? watch.filter((p) => typeof p === "string").map((p) => path.join(cwd, p)) : [];
		determineSourcePaths(project.getReader()).forEach((p) => pathsToWatch.push(p));
		depProjects.forEach((dep) => {
			determineSourcePaths(dep.getReader()).forEach((p) => pathsToWatch.push(p));
		});
		if (debug) {
			log.info(`Source paths to watch:`);
			pathsToWatch.forEach((file) => log.info(`  - ${file}`));
		}
		// watch the files
		let debounceTimer;
		const triggerChangeCallback = (file) => {
			if (typeof onChangeCallback === "function") {
				clearTimeout(debounceTimer);
				debounceTimer = setTimeout(() => {
					onChangeCallback(file);
				}, watchDebounce);
			}
		};
		watcher = chokidar
			.watch(pathsToWatch, {
				ignored: (file, stats) => {
					// ignore non-source code files
					if (stats?.isFile() && !/\.(js|jsx|ts|tsx|xml)$/.test(file)) {
						return true;
					} else {
						if (debug) {
							log.verbose(`[FSWATCHER] Watching changes on file: ${file}`);
						}
						return false;
					}
				},
				ignoreInitial: true,
			})
			.on("add", (file) => {
				if (debug) {
					log.verbose(`[FSWATCHER] File ${file} has been added`);
				}
				watcher.add(file);
				triggerChangeCallback(file);
			})
			.on("unlink", (file) => {
				if (debug) {
					log.verbose(`[FSWATCHER] File ${file} has been removed`);
				}
				watcher.unwatch(file);
				triggerChangeCallback(file);
			})
			.on("change", (file) => {
				if (debug) {
					log.verbose(`[FSWATCHER] File ${file} has been changed`);
				}
				log.info(`File ${file} has been changed. Checking for dependencies changes...`);
				triggerChangeCallback(file);
			});
	}

	// merge custom configurations from dependencies (only needed for middlewares, as tasks are built atomically)
	// this ensures that configuration doesn't need to be duplicated in the consuming project
	// the downside is that the regular configuration is not considered for the dependencies (only the customConfiguration)
	// which needs to follow a dedicated naming convention and the same structure as the regular configuration
	depProjects.forEach((dep) => {
		const customConfig = dep.getCustomConfiguration();
		const relatedCustomConfig = customConfig?.["ui5-tooling-modules"];
		// merge the skipTransform configuration from the dependencies if not skipping
		// the transformation of the whole project (usage of boolean values are overruling!)
		if (skipTransform !== true) {
			const customSkipTransform = relatedCustomConfig?.skipTransform;
			if (Array.isArray(customSkipTransform)) {
				if (!skipTransform) {
					skipTransform = [];
				}
				(skipTransform || []).push(...customSkipTransform);
				log.verbose(`The dependency "${dep.getName()}" provides the following "skipTransform" configuration: "${customSkipTransform.join(", ")}"`);
			} else if (typeof customSkipTransform === "boolean") {
				log.warn(
					`The dependency "${dep.getName()}" defines "skipTransform" with a boolean value. This configuration is ignored! Pleas specify the "skipTransform" with a string[] to be considered...`,
				);
			}
		}
		// detect the customConfiguration of the dependencies to derive the additionalDependencies
		// other properties are so far not considered from the dependencies
		if (Array.isArray(relatedCustomConfig?.additionalDependencies)) {
			const customAdditionalConfig = relatedCustomConfig.additionalDependencies;
			config.additionalDependencies = config.additionalDependencies || [];
			config.additionalDependencies.push(...customAdditionalConfig);
			log.verbose(`The dependency "${dep.getName()}" provides the following "additionalDependencies" configuration: ${customAdditionalConfig.join(", ")}`);
		}
	});

	// logic which bundles and watches the modules coming from the
	// node_modules or dependencies via NPM package names
	const requestedModules = new Set();
	// inject the entrypoints from the configuration
	config.entryPoints?.forEach((entry) => {
		requestedModules.add(entry);
	});
	// start bundling
	let whenBundled, scanTime, bundleTime;
	const bundleAndWatch = async ({ moduleName, force, skipCache }) => {
		if (moduleName && !requestedModules.has(moduleName)) {
			requestedModules.add(moduleName);
		}
		if (force || !whenBundled) {
			// first, we need to scan for all unique dependencies
			scanTime = Date.now();
			whenBundled = scan(depReaderCollection, config, { cwd, depPaths })
				.then(({ uniqueModules }) => {
					// second, we trigger the bundling of the unique dependencies
					debug && log.info(`Scanning took ${Date.now() - scanTime} millis`);
					bundleTime = Date.now();
					const modules = Array.from(uniqueModules);
					// TODO: check whether we should really include the requested modules into the bundle
					//       because this could also be a negative side-effect when running the build task
					//       which wouldn't include the requested modules into the build - but in this case
					//       we need it since new modules are added dynamically during development
					Array.from(requestedModules)
						.filter((mod) => !uniqueModules.has(mod))
						.forEach((mod) => {
							log.warn(
								`Including module "${mod}" to bundle which has been requested dynamically! This module may not be packaged during the build (please check your dependencies of your package.json, if it is listed in devDependencies make sure to move it into the dependencies section)!`,
							);
							modules.push(mod);
						});
					return getBundleInfo(modules, Object.assign({}, config, { skipCache }), { cwd, depPaths, isMiddleware: true });
				})
				.then((bundleInfo) => {
					debug && log.info(`Bundling took ${Date.now() - bundleTime} millis`);
					if (watcher) {
						const relatedPaths = bundleInfo.getRelatedPaths();
						debug && log.info(`Watching ${relatedPaths?.length} files...`);
						relatedPaths?.forEach((p) => {
							watcher.add(p);
							debug && log.verbose(`[FSWATCHER] File ${p} has been added`);
						});
						onChangeCallback = function (file) {
							// the bundling should only be retriggered when the file is part of the related paths
							const shouldSkipCache = relatedPaths.includes(file);
							bundleAndWatch({ force: true, skipCache: shouldSkipCache });
						};
					}
					return bundleInfo;
				});
		}
	};

	// determine the NPM package name from a given source
	const getNpmPackageName = (source) => {
		const npmPackageScopeRegEx = /^((?:(@[^/]+)\/)?([^/]+))(?:\/(.*))?$/;
		return npmPackageScopeRegEx.exec(source)?.[1];
	};

	// check the existence of an NPM package for a given resource
	const npmPackageCache = {};
	const existsNpmPackageForResource = (source) => {
		const npmPackage = getNpmPackageName(source);
		if (npmPackageCache[npmPackage] === undefined) {
			const existsPackage = !!resolveModule(`${npmPackage}/package.json`, { cwd, depPaths, additionalDeps: config.additionalDependencies, isMiddleware: true });
			npmPackageCache[npmPackage] = existsPackage;
		}
		return npmPackageCache[npmPackage];
	};

	// return the middleware
	const projectNamespace = projectInfo.type === "application" ? "/" : `/resources/${projectInfo.namespace}/`;
	return async (req, res, next) => {
		// determine the request path
		const pathname = req.url?.match("^[^?]*")[0];

		// perf
		const time = Date.now();

		// check for resources requests (either in the thirdparty namespace or in the resources namespace)
		const matchRes = /^\/resources\/(.*)$/.exec(pathname);
		const matchNS = config.addToNamespace ? new RegExp(`^${projectNamespace}${thirdpartyNamespace}/(.*)$`).exec(pathname) : matchRes;
		const match = matchNS || matchRes;
		if (match) {
			// determine the module name (for JS resources we strip the extension)
			let moduleName = match[1];
			const ext = path.extname(moduleName);
			if (ext === ".js") {
				moduleName = moduleName.substring(0, moduleName.length - 3);
			}

			// in some cases there is a request to a module of an NPM package and in this
			// case we still need to trigger the bundle and watch process to create the
			// bundle info from which we can extract the resource (e.g. webc libraries)
			const existsPackage = existsNpmPackageForResource(moduleName);
			let resource;
			if (existsPackage) {
				// check if the resource exists in node_modules
				resource = getResource(moduleName, { cwd, depPaths, isMiddleware: true });
			}

			let bundleInfo = whenBundled && (await whenBundled);

			// if a resource has been found in node_modules, we will
			// trigger the bundling process and watch the bundled resources
			if (!bundleInfo?.getEntry(moduleName) && (resource || existsPackage)) {
				bundleAndWatch({ moduleName });
			}

			// if the resource is a bundled resource, we need to wait for it
			bundleInfo = whenBundled && (await whenBundled);
			if (bundleInfo?.error) {
				log.error(bundleInfo.error);
			}
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

					if (matchRes && !matchNS) {
						// "Stellvertreter" module for the resource to load the correct module
						// which is only needed for the middleware and not for the build
						res.end(`sap.ui.define(["${projectInfo.namespace}/${thirdpartyNamespace}/${moduleName}"], function(module) { return module; });`);
					} else {
						// respond the content
						// /!\ non-modules and resources with a path are served as stream (encoding!)
						if (resource.type === "module" || (!resource.path && resource.code)) {
							res.end(resource.code);
						} else if (resource.path) {
							const stream = createReadStream(resource.path);
							stream.pipe(res);
						}
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

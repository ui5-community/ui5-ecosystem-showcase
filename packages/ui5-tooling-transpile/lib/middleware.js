/* eslint-disable jsdoc/check-param-names */
const { extname } = require("path");
const { readFileSync } = require("fs");

/**
 * Custom middleware to transpile resources to JavaScript modules.
 *
 * Hint: mime type for TypeScript is "application/x-typescript"
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/logger/Logger} parameters.log Logger instance
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
 * @returns {Function} Middleware function to use
 */
module.exports = async function ({ log, resources, options, middlewareUtil }) {
	const {
		createConfiguration,
		createBabelConfig,
		normalizeLineFeeds,
		determineResourceFSPath,
		transformAsync,
		shouldHandlePath,
		resolveNodeModule
	} = require("./util")(log);

	const cwd = middlewareUtil.getProject().getRootPath() || process.cwd();
	const config = createConfiguration({ configuration: options?.configuration || {}, isMiddleware: true }, cwd);
	const babelConfig = await createBabelConfig({ configuration: config, isMiddleware: true }, cwd);

	// in case of local development of framework dependencies, they are not listed as
	// a framework dependency for the project and this should not be considered as
	// a framework dependency for this middleware to run it regardless
	const frameworkDependencies = (middlewareUtil.getProject().getFrameworkDependencies() || []).map((dep) => dep.name);
	const localFrameworkDependencies = (middlewareUtil.getDependencies() || []).filter((dep) => {
		return frameworkDependencies.indexOf(dep) === -1; // keep just the not found dependencies
	});

	// filter the readers for non framework dependencies only
	const isFrameworkProject = function isFrameworkProject(project) {
		return project?.isFrameworkProject() && localFrameworkDependencies?.indexOf(project.getName()) === -1;
	};
	const reader = config.transpileDependencies
		? middlewareUtil.resourceFactory.createReaderCollection({
				name: "Local resource collection",
				readers: [
					resources.rootProject,
					...(resources.dependencies?._readers || []).filter((reader) => {
						return !isFrameworkProject(reader?._readers?.[0]?._project);
					})
				]
			})
		: resources.rootProject;

	const outputCache = {};
	const transpileAsync = async (resource) => {
		// lookup the cached resource or create one if not found
		let cachedResource = outputCache[resource.getPath()];
		if (!cachedResource) {
			outputCache[resource.getPath()] = cachedResource = {};
		}

		// compare the timestamp of the cached and requested resource
		// and retrigger the transformation if the timestamp differs
		if (resource.getStatInfo().mtime?.getTime() !== cachedResource.mtime?.getTime()) {
			config.debug && log.info(`Transpiling resource ${resource.getPath()}`);

			// read file into string
			const source = await resource.getString();

			// transpile the source
			const result = await transformAsync(
				source,
				Object.assign({}, babelConfig, {
					filename: determineResourceFSPath(resource) // necessary for source map <-> source assoc
				})
			);

			// store the cached resource
			cachedResource.code = result.code;
			cachedResource.mtime = resource.getStatInfo().mtime;
		}

		// return the code of the cached resource
		return cachedResource.code;
	};

	// pre-transform sources (fill the server cache)
	if (config.transformAtStartup) {
		const resources = await reader.byGlob(`**/*${config.filePattern}`);
		await Promise.all(
			resources
				.filter((resource) => {
					const resourcePath = resource.getPath();
					return (
						!resourcePath.endsWith(".d.ts") &&
						shouldHandlePath(resourcePath, config.excludes, config.includes)
					);
				})
				.map((resource) => {
					return transpileAsync(resource);
				})
		);
	}

	// if the TypeScript interfaces should be created, launch the ts-interface-generator in watch mode
	if (config.generateTsInterfaces) {
		const generateTSInterfacesAPI = resolveNodeModule(
			"@ui5/ts-interface-generator/dist/generateTSInterfacesAPI",
			cwd
		);
		if (generateTSInterfacesAPI) {
			const { main } = require(generateTSInterfacesAPI);
			try {
				config.debug && log.info(`Starting "@ui5/ts-interface-generator" in watch mode...`);
				main({
					watch: true,
					loglevel: config.debug ? log.constructor.getLevel() : "error",
					config: config.tsConfigFile,
					jsdoc: config.generateTsInterfacesJsDoc
				});
			} catch (e) {
				log.error(e);
			}
		} else {
			config.debug &&
				log.warn(
					`Missing dependency "@ui5/ts-interface-generator"! TypeScript interfaces will not be generated until dependency has been added...`
				);
		}
	}

	// determine the NPM package name from a given source
	const getNpmPackageName = (source) => {
		const npmPackageScopeRegEx = /^((?:(@[^/]+)\/)?([^/]+))(?:\/(.*))?$/;
		return npmPackageScopeRegEx.exec(source)?.[1];
	};

	return async (req, res, next) => {
		const pathname = req.url?.match("^[^?]*")[0];
		if (pathname.endsWith(".js") && shouldHandlePath(pathname, config.excludes, config.includes)) {
			let pathWithFilePattern = pathname.replace(".js", config.filePattern);
			config.debug && log.verbose(`Lookup resource ${pathWithFilePattern}`);

			// allow alias patterns to be used in the path which can be rewritten using the
			// configuration option "aliasPatterns" (key: alias pattern, value: replacement)
			if (config.aliasPatterns || options?.configuration?.aliasPatterns) {
				Object.entries(config.aliasPatterns).forEach(([aliasPattern, replacement]) => {
					const re = new RegExp(aliasPattern, "g");
					if (re.test(pathWithFilePattern)) {
						config.debug &&
							log.verbose(`  --> Replacing alias pattern ${aliasPattern} with ${replacement}`);
						pathWithFilePattern = pathWithFilePattern.replace(re, replacement);
					}
				});
			}

			const matchedResources = await reader.byGlob(pathWithFilePattern);
			config.debug && log.verbose(`  --> Found ${matchedResources?.length || 0} match(es)!`);

			let resource = matchedResources?.[0];

			// SPECIAL CASE: usage of npm packages to transport UI5 resources (using marker file)
			// if the resource is not found, we try to resolve it as a node module as some
			// resources could be part of UI5 module projects (TODO: check for UI5 modules only)
			// this scenario is only relevant for the middleware as the build process will
			// already transpile the resources in the module project
			//
			// -----------------------------------------------------------
			// /!\ TODO: WE NEED TO DO THIS ALSO FOR THE BUILD PROCESS /!\
			// -----------------------------------------------------------
			if (!resource) {
				try {
					const match = new RegExp(`^/resources/(.*)\\.js$`).exec(pathname);
					if (match) {
						// determine the npm package name from the path
						const npmPackage = getNpmPackageName(match[1]);
						// check for the existence of the marker file which indicates that the
						// package is a UI5 module and we can lookup files there - in case of
						// not being a UI5 module an error will be thrown and we will ignore it
						require.resolve(`${npmPackage}/.ui5pkg`);
						// real path for the node module
						let realpath;
						// TODO: think about getting rid of the hard-coded file extension mappings
						//       and derive the file extensions from the provided file patterns
						try {
							realpath = require.resolve(`${match[1]}.tsx`);
						} catch {
							/* noop */
						}
						try {
							realpath = realpath || require.resolve(`${match[1]}.ts`);
						} catch {
							/* noop */
						}
						try {
							realpath = realpath || require.resolve(`${match[1]}.jsx`);
						} catch {
							/* noop */
						}
						try {
							realpath = realpath || require.resolve(`${match[1]}.js`);
						} catch {
							/* noop */
						}
						resource = middlewareUtil.resourceFactory.createResource({
							path: pathname.replace(/\.js$/, extname(realpath)),
							string: readFileSync(realpath, { encoding: "utf-8" })
						});
					}
				} catch {
					/* ignore error */
				}
			}

			if (resource) {
				// transpile the resource (+ error handling)
				try {
					const code = await transpileAsync(resource);

					// send out transpiled source
					let { contentType /*, charset */ } = middlewareUtil.getMimeInfo(".js");
					res.setHeader("Content-Type", contentType);
					res.end(normalizeLineFeeds(code));
				} catch (err) {
					res.status(500);
					console.error(err.message);
					res.end(JSON.stringify(err, undefined, 2));
				}
				// stop processing the request
				return;
			}
		}
		// not handled by the middleware => go ahead!
		next();
	};
};

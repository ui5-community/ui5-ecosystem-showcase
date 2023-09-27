/* eslint-disable jsdoc/check-param-names */
const path = require("path");

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
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
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
	const config = createConfiguration(options?.configuration || {}, cwd);
	const babelConfig = await createBabelConfig({ configuration: config, isMiddleware: true }, cwd);

	const reader = config.transpileDependencies
		? middlewareUtil.resourceFactory.createReaderCollection({
				name: "Local resource collection",
				readers: [
					resources.rootProject,
					...(resources.dependencies?._readers || []).filter((reader) => {
						return !reader?._readers?.[0]?._project?.isFrameworkProject();
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
					logLevel: config.debug ? log.constructor.getLevel() : "error",
					config: path.join(cwd, "tsconfig.json")
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

	return async (req, res, next) => {
		const pathname = req.url?.match("^[^?]*")[0];
		if (pathname.endsWith(".js") && shouldHandlePath(pathname, config.excludes, config.includes)) {
			const pathWithFilePattern = pathname.replace(".js", config.filePattern);
			config.debug && log.verbose(`Lookup resource ${pathWithFilePattern}`);

			const matchedResources = await reader.byGlob(pathWithFilePattern);
			config.debug && log.verbose(`  --> Found ${matchedResources?.length || 0} match(es)!`);

			const resource = matchedResources?.[0];
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

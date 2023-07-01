/* eslint-disable jsdoc/check-param-names */
const log = require("@ui5/logger").getLogger("server:custommiddleware:ui5-tooling-transpile");
const parseurl = require("parseurl");
const {
	createConfiguration,
	createBabelConfig,
	normalizeLineFeeds,
	determineResourceFSPath,
	transformAsync,
	determineProjectBasePath,
	shouldHandlePath
} = require("./util");

/**
 * Custom middleware to transpile resources to JavaScript modules.
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
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {function} Middleware function to use
 */
module.exports = async function ({ resources, options, middlewareUtil }) {
	const cwd = determineProjectBasePath(resources.rootProject) || process.cwd();
	const config = createConfiguration(options?.configuration || {}, cwd);
	const babelConfig = await createBabelConfig({ configuration: config, isMiddleware: true }, cwd);

	const reader = config.transpileDependencies ? resources.all : resources.rootProject;

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
	if (!config.skipTransformAtStartup) {
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

	return async (req, res, next) => {
		const pathname = parseurl(req)?.pathname;
		if (pathname.endsWith(".js") && shouldHandlePath(pathname, config.excludes, config.includes)) {
			const pathWithFilePattern = pathname.replace(".js", config.filePattern);
			config.debug && log.verbose(`Lookup resource ${pathWithFilePattern}`);

			const matchedResources = await reader.byGlob(pathWithFilePattern);
			config.debug && log.verbose(`  --> Found ${matchedResources?.length || 0} match(es)!`);

			const resource = matchedResources?.[0];
			if (resource) {
				// transpile the resource
				const code = await transpileAsync(resource);

				// send out transpiled source
				let { contentType /*, charset */ } = middlewareUtil.getMimeInfo(".js");
				res.setHeader("Content-Type", contentType);
				res.end(normalizeLineFeeds(code));

				// stop processing the request
				return;
			}
		}
		// not handled by the middleware => go ahead!
		next();
	};
};

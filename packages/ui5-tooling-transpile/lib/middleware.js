const babel = require("@babel/core");
const log = require("@ui5/logger").getLogger("server:custommiddleware:ui5-tooling-transpile");
const parseurl = require("parseurl");
const { createBabelConfig, normalizeLineFeeds } = require("./util");

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
module.exports = async function ({ resources, options /*, middlewareUtil */ }) {
	const config = options?.configuration || {};
	config.includes = config.includes || config.includePatterns;
	config.excludes = config.excludes || config.excludePatterns;

	const babelConfig = await createBabelConfig({ configuration: config, isMiddleware: true });

	let filePatternConfig = config.filePattern; // .+(ts|tsx)
	if (!filePatternConfig) {
		filePatternConfig = config.transpileTypeScript ? ".ts" : ".js";
	}

	const reader = config.transpileDependencies ? resources.all : resources.rootProject;

	return async (req, res, next) => {
		const pathname = parseurl(req)?.pathname;
		if (
			(pathname.endsWith(".js") && !(config.excludes || []).some((pattern) => pathname.includes(pattern))) ||
			(config.includes || []).some((pattern) => pathname.includes(pattern))
		) {
			const pathWithFilePattern = pathname.replace(".js", filePatternConfig);
			config.verbose && log.info(`Lookup resource ${pathWithFilePattern}`);

			const matchedResources = await reader.byGlob(pathWithFilePattern);
			config.verbose && log.info(`  --> Found ${matchedResources?.length || 0} match(es)!`);

			const resource = matchedResources?.[0];
			if (resource) {
				config.debug && log.info(`Transpiling resource ${resource.getPath()}`);

				// read file into string
				const source = await resource.getString();

				// transpile the source
				const result = await babel.transformAsync(
					source,
					Object.assign({}, babelConfig, {
						filename: resource.getPath() // necessary for source map <-> source assoc
					})
				);

				// send out transpiled source
				res.type(".js");
				res.end(normalizeLineFeeds(result.code));

				// stop processing the request
				return;
			}
		}
		// not handled by the middleware => go ahead!
		next();
	};
};

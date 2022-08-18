const babel = require("@babel/core");
const log = require("@ui5/logger").getLogger("server:custommiddleware:ui5-tooling-transpile");
const parseurl = require("parseurl");
const merge = require("lodash.merge")
const { createBabelConfig, normalizeLineFeeds } = require("./util");

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
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {function} Middleware function to use
 */
module.exports = function ({
    resources,
    options,
    middlewareUtil
}) {

    const config = options.configuration || {};

    const babelConfig = createBabelConfig({configuration: config, isMiddleware: true});

    let filePatternConfig = config.filePattern;

    if (!filePatternConfig) {
        filePatternConfig = config.transpileTypeScript ? ".ts" : ".js";
    }

    return async (req, res, next) => {

        if (
            req.path &&
            req.path.endsWith(".js") &&
            !req.path.includes("resources/") &&
            !(config.excludePatterns || []).some((pattern) => req.path.includes(pattern))
        ) {

            const pathname = parseurl(req).pathname;
            const pathWithPattern = pathname.replace(".js", filePatternConfig);
            log.info(`---> ${pathWithPattern}`);

            try {

                // grab the file via @ui5/fs.AbstractReader API
                const matchedResources = await  resources.rootProject.byGlob(pathWithPattern);
                config.debug && log.info(`handling ${req.path}...`);

                if (!matchedResources || !matchedResources.length) {
                    fileNotFoundError.file = pathWithPattern;
                    throw fileNotFoundError;
                }

                // prefer js over other extensions, otherwise grab first possible path
                const resource = matchedResources.find((r) => r.getPath() === pathname) || matchedResources[0]
                if (matchedResources.length > 1) {
                    log.warn(`found more than 1 file for given pattern (${filePatternConfig}): ${matchedResources.map((r) => r.getPath()).join(", ")} `);
                    log.info(`using: ${resource.getPath()}`);
                }

                // read file into string
                const source = await resource.getString();

                config.debug ? log.info(`...${pathWithPattern} transpiled!`) : null
                const babelConfigForFile = merge({}, babelConfig, {
                    filename: pathWithPattern // necessary for source map <-> source assoc
                })
                let result = await babel.transformAsync(source, babelConfigForFile);

                // send out transpiled source + source map
                res.type(".js");
                res.end(normalizeLineFeeds(result.code));

            } catch(err) {
                if (err.code === 404) {
                    log.warn(`...file not found: ${err.file}!`)
                } else {
                    log.error(err)
                }
				next();
            }
        }
		else {
			next();
		}
    }
}

const babel = require("@babel/core");
const os = require("os");
const log = require("@ui5/logger").getLogger("server:custommiddleware:livetranspile");
const merge = require("lodash.merge");

let fileNotFoundError = new Error("file not found!");
fileNotFoundError.code = 404;
fileNotFoundError.file = "";

/**
 * @typedef {Object} [configuration] configuration
 * @property {string} [babelConfig] object to use as configuration for babel instead of the default configuration  
defined in this middleware
 * @property {string|yo<password>} [password] the password => env:UI5_MIDDLEWARE_ONELOGIN_PASSWORD
 * @property {boolean|yo<confirm:false>} [transpileAsync] transpiling `async/await` using babel-plugin-transform-async-to-promises, which doesn't require regenerator runtime
the regenerator runtime 
 * @property {boolean|yo<confirm:false>} [debug] see output
 */

/**
 * Custom UI5 Server middleware example
 *
 * @param {object} parameters Parameters
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @returns {Function} Middleware function to use
 */
module.exports = function ({ resources, options, middlewareUtil }) {
	const config = options.configuration || {};
	const plugins = config.transpileAsync
		? [
				[
					"babel-plugin-transform-async-to-promises",
					{
						inlineHelpers: true,
					},
				],
		  ]
		: [];
	const babelConfig = config.babelConfig
		? config.babelConfig
		: {
				sourceMaps: "inline",
				plugins,
				presets: [
					[
						"@babel/preset-env",
						{
							targets: {
								browsers: "last 2 versions, ie 10-11",
							},
						},
					],
				],
		  };
	const filePatternConfig = config.filePattern || ".js";
	return (req, res, next) => {
		const reqPath = middlewareUtil.getPathname(req);
		if (reqPath && reqPath.endsWith(".js") && !reqPath.includes("resources/") && !(config.excludePatterns || []).some((pattern) => reqPath.includes(pattern))) {
			const pathWithPattern = reqPath.replace(".js", filePatternConfig);

			// grab the file via @ui5/fs.AbstractReader API
			return resources.rootProject
				.byGlob(pathWithPattern)
				.then((resources) => {
					config.debug && log.info(`handling ${reqPath}...`);

					if (!resources || !resources.length) {
						fileNotFoundError.file = pathWithPattern;
						throw fileNotFoundError;
					}

					// prefer js over other extensions, otherwise grab first possible path
					const resource = resources.find((r) => r.getPath() === reqPath) || resources[0];
					if (resources.length > 1) {
						log.warn(`found more than 1 file for given pattern (${filePatternConfig}): ${resources.map((r) => r.getPath()).join(", ")} `);
						log.info(`using: ${resource.getPath()}`);
					}

					// read file into string
					return resource.getString();
				})
				.then((source) => {
					config.debug ? log.info(`...${reqPath} transpiled!`) : null;
					const babelConfigForFile = merge({}, babelConfig, {
						filename: reqPath, // necessary for source map <-> source assoc
					});
					return babel.transformAsync(source, babelConfigForFile);
				})
				.then((result) => {
					// send out transpiled source + source map
					res.type(".js");
					// since Babel does not care about linefeeds (https://github.com/babel/babel/issues/8921#issuecomment-492429934)
					// we have to search for any EOL character and replace it with correct EOL for this OS
					let correctLinefeed = result.code.replace(/\r\n|\r|\n/g, os.EOL);
					res.end(correctLinefeed);
				})
				.catch((err) => {
					if (err.code === 404) {
						log.warn(`...file not found: ${err.file}!`);
					} else {
						log.error(err);
					}
					next();
				});
		} else {
			next();
		}
	};
};

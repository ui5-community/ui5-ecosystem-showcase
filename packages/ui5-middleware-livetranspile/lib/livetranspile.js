/**
 * @typedef {Object} [configuration] configuration
 * @property {string} [babelConfig] object to use as configuration for babel instead of the default configuration
 * @property {string} [excludePatterns] array of paths inside `$yourapp/webapp/` to exclude from live transpilation,  e.g. 3-rd party libs in `lib/*`
 * @property {boolean|yo<confirm|false>} [transpileAsync] transpiling `async/await` using babel-plugin-transform-async-to-promises, which doesn't require regenerator runtime
 * @property {boolean|yo<confirm|false>} [debug] see output
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
module.exports = require("ui5-tooling-transpile/lib/middleware");

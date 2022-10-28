/**
 * @typedef {Object} [configuration] configuration
 * @property {string} [babelConfig] object to use as configuration for babel instead of the default configuration
 * @property {string} [excludePatterns] array of paths inside `$yourapp/webapp/` to exclude from live transpilation,  e.g. 3-rd party libs in `lib/*`
 * @property {boolean|yo<confirm|false>} [transpileAsync] transpiling `async/await` using babel-plugin-transform-async-to-promises, which doesn't require regenerator runtime
 * @property {boolean|yo<confirm|false>} [debug] see output
 */
/**
 * Task to transpiles ES6 code into ES5 code.
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @returns {Promise<undefined>} Promise resolving with undefined once data has been written
 */
module.exports = require("ui5-tooling-transpile/lib/task");

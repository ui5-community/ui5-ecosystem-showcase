const log = require("@ui5/logger").getLogger("server:custommiddleware:servestatic");

const path = require("path");
const serveStatic = require("serve-static");

require("dotenv").config();

const envOptionRegEx = /^\${env\.(.*)}$/;

/**
 * Parses the configuration option. If a ${env.<PARAM>} pattern is detected,
 * the corresponding .env-file value will be retrieved. Otherwise the
 * original value will be returned
 * @param {String} optionValue the entered config option
 * @return {string|*}
 */
const parseConfigOption = (optionValue) => {
  if (!optionValue) {
    return undefined;
  }
  if (envOptionRegEx.test(optionValue)) {
    const envVariable = optionValue.match(envOptionRegEx)[1];
    return process.env[envVariable];
  } else {
    return optionValue;
  }
};

/**
 * Custom UI5 Server middleware example
 *
 * @param {Object} parameters Parameters
 * @param {Object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {Object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {function} Middleware function to use
 */
module.exports = function ({ resources, options }) {
  let rootPath = parseConfigOption(options.configuration.rootPath);
  if (!rootPath) {
    throw new Error(`No Value for 'rootPath' supplied`);
  }
  // resolve the rootPath to be absolute (should happen in serveStatic already, but used for logging)
  rootPath = path.resolve(rootPath);
  // some logging to see the root path in case of issues
  options.configuration.debug ? log.info(`Starting static serve from ${rootPath}`) : null;
  return serveStatic(rootPath);
};

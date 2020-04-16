let serveStatic = require('serve-static');
const log = require("@ui5/logger").getLogger("server:custommiddleware:servestatic");
require("dotenv").config();

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
module.exports = function({resources, options}) {
   const pathIsEnvVariable = options.configuration && options.configuration.pathIsEnvVar;
   let rootPath = options.configuration.rootPath;
   if (!rootPath) {
       throw new Error(`No Value for 'rootPath' supplied`);
   }
   if (pathIsEnvVariable) {
       if (!process.env.hasOwnProperty(rootPath)) {
           throw new Error(`Environment Variable ${rootPath} was not found in .env file`);
       }
       rootPath = process.env[rootPath];
   }
   options.configuration.debug ? log.info(`Starting static serve from ${rootPath}`) : null;
   return serveStatic(rootPath);
};

const connectLivereload = require('connect-livereload');
const livereload = require('livereload');
const log = require("@ui5/logger").getLogger("middleware:custom:livereload");
const path = require("path");



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
    const livereloadServer = livereload.createServer({
        debug: options.configuration.debug,
        extraExts: options.configuration.ext || "xml,json,properties"
    }, () => {
        log.info("Livereload server started...");
    });
    options.configuration.debug ? log.info(`Livereload connecting to port ${options.configuration.port} for path ${options.configuration.path}`) : null;
    livereloadServer.watch(path.join(process.cwd(), options.configuration.path));
    return connectLivereload({
        port: options.configuration.port
    });
};

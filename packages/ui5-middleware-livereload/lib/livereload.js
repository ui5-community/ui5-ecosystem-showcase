const connectLivereload = require("connect-livereload");
const livereload = require("livereload");
const path = require("path");
const log = require("@ui5/logger").getLogger("server:custommiddleware:livereload");

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
module.exports = ({ resources, options }) => {
    let port = 35729;
    if (options.configuration && options.configuration.port) {
        port = options.configuration.port;
    }
    let watchPath = "webapp";
    // due to compatibility reasons we keep the path as watchPath (watchPath has higher precedence than path)
    if (options.configuration && (options.configuration.watchPath || options.configuration.path)) {
        watchPath = options.configuration.watchPath || options.configuration.path;
    }
    let extraExts = "xml,json,properties";
    if (options.configuration && options.configuration.extraExts) {
        extraExts = options.configuration.extraExts;
    }
    let debug = true;
    if (options.configuration && options.configuration.debug) {
        debug = options.configuration.debug;
    }
    const livereloadServer = livereload.createServer(
        {
            debug: debug,
            extraExts: extraExts,
            port: port
        },
        () => {
            log.info("Livereload server started!");
        }
    );
    debug ? log.info(`Livereload connecting to port ${port} for path ${watchPath}`) : null;
    livereloadServer.watch(path.join(process.cwd(), watchPath));
    // connect-livereload already holds the 
    // method sig (req, res, next)
    return connectLivereload({
        port: port
    });
};

const browserSync = require("browser-sync")
const fs = require("fs")
const inject = require("./inject")
const log = require("@ui5/logger").getLogger("server:custommiddleware:iasync")
const path = require("path")

// read in UI5 "enhancements" that enable syncing click actions
// browsersync only syncs "clicks", but e.g. no "taps"
const customUI5Html = fs.readFileSync(path.join(`${__dirname}`, "ui5mangler.html"), { encoding: "utf-8" })

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
module.exports = function({ resources, options }) {
    let port = options.configuration && options.configuration.port ? options.configuration.port : 3000
    const bs = browserSync.create().init(
        {
            logSnippet: false,
            https: options.configuration && options.configuration.https ? options.configuration.https : false,
            // http2 here, e.g. from ui5-tooling
            httpModule:
                options.configuration && options.configuration.httpModule
                    ? options.configuration.httpModule
                    : undefined,
            logLevel: options.configuration && options.configuration.debug ? "debug" : "info",
            // per default, log connections
            logConnections:
                options.configuration && options.configuration.logConnections
                    ? options.configuration.logConnections
                    : true,
            notify: false,
            open: false,
            port: port,
            socket: {
                port: port
            },
            ui: false
        },
        (err, instance) => {
            log.info(`started on port ${port}`)
        }
    )
    return inject(bs, {}, customUI5Html)
}

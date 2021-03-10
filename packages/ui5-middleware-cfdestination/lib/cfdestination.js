const approuter = require('@sap/approuter')();
const fs = require('fs');
const request = require('request');
const log = require("@ui5/logger").getLogger("server:custommiddleware:cfdestination");

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
    request.debug = options.configuration.debug; // pass debug flag on to underlying request lib
    process.env.XS_APP_LOG_LEVEL = options.configuration.debug ? 'DEBUG' : 'ERROR';
    // read in the cf config file
    const xsappConfig = JSON.parse(fs.readFileSync(options.configuration.xsappJson, 'utf8'));
    const xsappPath = options.configuration.xsappJson.replace("xs-app.json", "");

    // the default auth mechanism is set to none but the user can pass an auth method using the options
    xsappConfig.authenticationMethod = options.configuration.authenticationMethod || "none";

    let regExes = [];
    xsappConfig.routes = xsappConfig.routes
        .filter((route) => !route.localDir && (options.configuration.allowServices || !route.service)); //ignore routes that point to web apps as they are already hosted by the ui5 tooling

    xsappConfig.routes.forEach(route => {
        /* Authentication type should come from route if authenticationMethod is set to "route", otherwise set to "none" */
        route.authenticationType = (xsappConfig.authenticationMethod.toLowerCase() === "route") ? route.authenticationType : "none";

        // ignore /-redirects (e.g. "^/(.*)"
        // a source declaration such as "^/backend/(.*)$" is needed
        if (route.source.match(/.*\/.*\/.*/)) {
            regExes.push(new RegExp(route.source));
            options.configuration.debug ? log.info(`adding cf-like destination "${route.destination}" proxying reqs to ${route.source}`) : null;
        }
    });

    // req-use app-router with config file to run in "shadow" mode
    process.env.destinations = JSON.stringify(options.configuration.destinations || []);
    if (options.configuration.debug && process.env.destinations.length === 0) {
        log.info(`Provided destinations are empty`);
    }

    approuter.start({
        port: options.configuration.port,
        xsappConfig: xsappConfig,
        workingDir: xsappPath || "."
    });
    return (req, res, next) => {
        // check req.path for match with each route.source
        // and proxy to localhost:${options.configuration.port}
        let match = false;
        let url = "";
        for (let [index, regEx] of regExes.entries()) {
            if (regEx.test(req.path)) {
                match = true;
                url = `${req.protocol}://localhost:${options.configuration.port}${req.originalUrl}`;

                break;
            }
        }
        if (match) {
            options.configuration.debug ? log.info(`proxying ${req.method} ${req.originalUrl} to ${url}...`) : null;
            req.pipe(request(url)).pipe(res);
        } else {
            next();
        }
    };
};

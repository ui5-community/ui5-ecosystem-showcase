const babel = require('@babel/core');
const path = require('path');
const log = require("@ui5/logger").getLogger("middleware:customtask:livetranspile");

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
module.exports = function ({resources, options}) {
    return (req, res, next) => {
        if (req.path.endsWith('.js')) {
            options.configuration.debug ? log.info(`transpiling ${req.path}...`) : null;
            babel.transformFileAsync(path.join(process.cwd(), 'webapp', req.path), {
                sourceMaps: "both",
                presets: [
                    ["@babel/preset-env", {
                        "targets": {
                            "browsers": "last 2 versions, ie 10-11"
                        }
                    }]
                ]
            })

                .then(result => {
                    res.type('.js');
                    res.send(result.code);
                })
                .catch(err => {
                    log.warn(err);
                    next();
                })
        } else {
            next();
        }
    }
};

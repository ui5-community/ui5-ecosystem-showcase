const babel = require('@babel/core');
const parseurl = require('parseurl');
const log = require("@ui5/logger").getLogger("middleware:customtask:livetranspile");

let fileNotFoundError = new Error('file not found!');
fileNotFoundError.code = 404;
fileNotFoundError.file = '';

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
            options.configuration.debug ? log.info(`handling ${req.path}...`) : null;
            const pathname = parseurl(req).pathname;

            // grab the file via @ui5/fs.AbstractReader API
            return resources.rootProject.byPath(pathname)
                .then(resource => {
                    if (!resource) {
                        fileNotFoundError.file = pathname;
                        throw fileNotFoundError;
                    }
                    // read file into string
                    return resource.getString();
                })
                .then(source => {
                    options.configuration.debug ? log.info(`...transpiling!`) : null;
                    return babel.transformAsync(source, {
                            filename: pathname, // necessary for source map <-> source assoc
                            sourceMaps: 'inline',
                            presets: [
                                ["@babel/preset-env", {
                                    "targets": {
                                        "browsers": "last 2 versions, ie 10-11"
                                    }
                                }]
                            ]
                        }
                    )
                })
                .then(result => {
                    // send out transpiled source + source map
                    res.type('.js');
                    res.end(result.code);
                })
                .catch(err => {
                    if (err.code === 404) {
                        log.warn(`...file not found: ${err.file}!`);
                    } else {
                        log.error(err);
                    }
                    next();
                })
        } else {
            next();
        }
    }
};

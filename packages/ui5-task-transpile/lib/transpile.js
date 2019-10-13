const path = require("path");
const babel = require("@babel/core");
const log = require("@ui5/logger").getLogger("builder:customtask:transpile");

/**
 * Task to transpiles ES6 code into ES5 code.
 *
 * @param {Object} parameters Parameters
 * @param {DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {Object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @returns {Promise<undefined>} Promise resolving with undefined once data has been written
 */
module.exports = function({workspace, dependencies, options}) {
	return workspace.byGlob("/**/*.js").then((resources) => {
        return Promise.all(resources.map((resource) => {
            if (!(options.configuration && options.configuration.excludePatterns || []).some(pattern => resource.getPath().includes(pattern))) {
                return resource.getString().then((value) => {
                    options.configuration && options.configuration.debug && log.info("Transpiling file " + resource.getPath());
                    return babel.transformAsync(value, {
                        presets: [
                            ["@babel/preset-env", {
                                "targets": {
                                    "browsers": "last 2 versions, ie 10-11"
                                }
                            }]
                        ]
                    });
                }).then((result) => {
                    resource.setString(result.code);
                    workspace.write(resource);
                });
            } else {
                return Promise.resolve();
            }
        }));
    });
};
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
            return resource.getString().then((value) => {
                log.info("Transpiling file " + resource.getPath());
                return babel.transformAsync(value, {
                    sourceMap: false,
                    presets: ["@babel/preset-env"],
                    plugins: [["@babel/plugin-transform-modules-commonjs", {
                        "strictMode": false 
                    }]]
                });
            }).then((result) => {
                resource.setString(result.code);
                workspace.write(resource);
            });
        }));
    });
};
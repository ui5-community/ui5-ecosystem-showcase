const path = require("path");
const os = require("os");
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
    const config = options.configuration || {};
    const plugins = []
      .concat(
        config.removeConsoleStatements
          ? [["transform-remove-console"]]
          : []
      )
      .concat(
        config.transpileAsync
          ? [
              [
                "babel-plugin-transform-async-to-promises",
                {
                  inlineHelpers: true,
                },
              ],
            ]
          : []
      );

    const babelConfig =
      config.babelConfig
        ? config.babelConfig
        : {
            plugins,
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    browsers: "last 2 versions, ie 10-11",
                  },
                },
              ],
            ],
          };

    const filePatternConfig = config.filePattern || ".js"

    return workspace.byGlob("/**/*" + filePatternConfig).then((resources) => {
        return Promise.all(resources.map((resource) => {
            const filePath = resource.getPath().replace(new RegExp("\\.[^.]+$"), ".js");

            if (!(config.excludePatterns || []).some(pattern => resource.getPath().includes(pattern))) {
                return resource.getString().then((value) => {
                    config.debug && log.info("Transpiling file " + resource.getPath());

                    // add file name
                    babelConfig.filename = filePath;

                    return babel.transformAsync(value, babelConfig);
                }).then((result) => {
                    // since Babel does not care about linefeeds (https://github.com/babel/babel/issues/8921#issuecomment-492429934)
                    // we have to search for any EOL character and replace it with correct EOL for this OS
                    // otherwise we might get mixed linefeed error when deploying to NW ABAP (https://github.com/petermuessig/ui5-ecosystem-showcase/issues/115)
                    let correctLinefeed = result.code.replace(/\r\n|\r|\n/g, os.EOL);
                    resource.setString(correctLinefeed);
                    resource.setPath(filePath);
                    workspace.write(resource);
                });
            } else {
                return Promise.resolve();
            }
        }));
    });
};
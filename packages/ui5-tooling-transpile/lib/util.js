module.exports = {

    /**
     * Generates a UI5 AMD-like bundle for a module out of the node_modules
     *
     * @param {object} configuration task/middleware configuration
     * @returns the babel plugins configuration
     */
    createBabelConfig: function createBabelConfig({configuration, isMiddleware, isTask}) {

        // is the babel configuration defined in the ui5.yaml?
        let babelConfig = configuration.babelConfig;
        if (!babelConfig) {

            // create the plugin configuration based on yaml config options
            const plugins = [];
            if (configuration.removeConsoleStatements) {
                plugins.concat([
                    ["transform-remove-console"]
                ]);
            }
            if (configuration.transpileAsync) {
                plugins.concat(["babel-plugin-transform-async-to-promises", {
                    inlineHelpers: true
                }]);
            }

            if (configuration.transpileTypeScript) {

                // the TypeScript babel configuration
                babelConfig = {
                    plugins,
                    presets: ["transform-ui5", "@babel/preset-typescript"],
                    ignore: ["**/*.d.ts"]
                };

            } else {

                // the default babel configuration
                babelConfig = {
                    plugins,
                    presets: [
                        ["@babel/preset-env", {
                            targets: {
                                browsers: "last 2 versions, ie 10-11",
                            }
                        }],
                    ],
                };

            }

            // in the middleware case we generate the sourcemaps inline for
            // debugging purposes since the middleware may not know about the
            // sourcemaps files next to the source file
            if (isMiddleware) {
                babelConfig.sourceMaps = "inline";
            } else {
                babelConfig.sourceMaps = true;
            }

        }
    },

    /**
     * Normalizes the line feeds of the code to OS default
     *
     * @param {string} code the code
     * @returns the normalized code
     */
    normalizeLineFeeds: function normalizeLineFeeds(code) {
        // since Babel does not care about linefeeds, see here:
        // https://github.com/babel/babel/issues/8921#issuecomment-492429934
        // we have to search for any EOL character and replace it
        // with correct EOL for this OS
        return code.replace(/\r\n|\r|\n/g, os.EOL)
    }

};

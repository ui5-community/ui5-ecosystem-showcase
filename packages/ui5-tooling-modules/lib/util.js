const rollup = require("rollup");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const nodePolyfills = require('rollup-plugin-polyfill-node');

// local bundle cache
const bundleCache = {};

module.exports = {

    /**
     * Generates a UI5 AMD-like bundle for a module out of the node_modules
     *
     * @param {string} moduleName the module name
     * @returns the content of the bundle or undefined
     */
    generateBundle: async function generateBundle(moduleName) {

        let bundling = false;

        try {

            // try to resolve the module name from node modules (bare module)
            const modulePath = require.resolve(moduleName);
            // DEBUG: when linking the middleware, you need to use custom paths
            /*
            const modulePath = require.resolve(moduleName, {
                paths: [
                    require("path").join(process.cwd())
                ]
            });
            */

            let cachedBundle = bundleCache[moduleName];
            if (!cachedBundle) {

                bundling = true;

                // create a bundle (maybe in future we should again load the )
                const bundle = await rollup.rollup({
                    input: modulePath,
                    plugins: [
                        //typescript(),
                        nodePolyfills(),
                        nodeResolve({
                            browser: true,
                            mainFields: ["module", "main"]
                        }),
                        json(),
                        commonjs()
                    ]
                });

                // generate output specific code in-memory
                // you can call this function multiple times on the same bundle object
                const { output } = await bundle.generate({
                    output: {
                        format: 'amd',
                        amd: {
                            define: "sap.ui.define"
                        }
                    }
                });

                // Right now we only support one chunk as build result
                // should be also given by the rollup configuration!
                if (output.length === 1 && output[0].type === "chunk") {
                    cachedBundle = bundleCache[moduleName] = output[0].code;
                }

            }

            return cachedBundle;

        } catch (err) {
            if (bundling) {
                console.error(`Couldn't bundle ${moduleName}: ${err}`);
            }
        }

    }

};

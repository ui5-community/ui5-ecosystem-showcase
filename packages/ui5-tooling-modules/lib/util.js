const rollup = require("rollup");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const injectProcessEnv = require('rollup-plugin-inject-process-env');

const { readFile } = require("fs").promises;
const espree = require('espree');
const estraverse = require('estraverse');


// local bundle cache
const bundleCache = {};

module.exports = {

    /**
     * Generates a UI5 AMD-like bundle for a module out of the node_modules
     *
     * @param {string} moduleName the module name
     * @param {boolean} skipCache skip the module cache
     * @returns the content of the bundle or undefined
     */
    generateBundle: async function generateBundle(moduleName, skipCache) {

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
            if (skipCache || !cachedBundle) {

                bundling = true;

                // is the bundle a UI5 module?
                const moduleContent = await readFile(modulePath, { encoding: "utf8" });
                const program = espree.parse(moduleContent, { range: true, comment: true, tokens: true, ecmaVersion: "latest" });
                let isUI5Module = false;
                estraverse.traverse(program, {
                    enter(node, parent) {
                        if (node?.type === "CallExpression" &&
                            /require|define/.test(node?.callee?.property?.name) &&
                            node?.callee?.object?.property?.name == "ui" &&
                            node?.callee?.object?.object?.name == "sap") {
                                isUI5Module = true;
                        }
                    }
                });

                // only transform non-UI5 modules
                if (!isUI5Module) {

                    // create a bundle (maybe in future we should again load the )
                    const bundle = await rollup.rollup({
                        input: moduleName,
                        plugins: [
                            //typescript(),
                            nodePolyfills(),
                            nodeResolve({
                                browser: true,
                                mainFields: ["module", "main"]
                            }),
                            json(),
                            require("./rollup-skip-assets")(),
                            commonjs(),
                            injectProcessEnv({
                                NODE_ENV: "production"
                            })
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

                } else {
                    cachedBundle = bundleCache[moduleName] = moduleContent;
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

const path = require("path");
const { readFile } = require("fs").promises;

const rollup = require("rollup");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const nodePolyfills = require('rollup-plugin-polyfill-node');
const injectProcessEnv = require('rollup-plugin-inject-process-env');

const espree = require('espree');
const estraverse = require('estraverse');


// local bundle cache
const bundleCache = {};

/**
 * Checks whether the given content is a UI5 module or not
 *
 * @param {string} content the content of a JS module
 * @returns {boolean} true, if the JS module is a UI5 module
 */
function isUI5Module(content) {
    try {
        const program = espree.parse(content, { range: true, comment: true, tokens: true, ecmaVersion: "latest" });
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
        return isUI5Module;
    } catch (err) {
        return false;
    }
};

module.exports = {

    /**
     * Lookup and returns a resource from the node_modules. In case
     * of JS modules an UI5 AMD-like bundle is being created. For
     * UI5 modules or any other asset, just the content is being
     * returned.
     *
     * @param {string} moduleName the module name
     * @param {object} [options] additional options
     * @param {boolean} [options.skipCache] skip the module cache
     * @returns the content of the resource or undefined
     */
    getResource: async function getResource(moduleName, {skipCache}) {

        let bundling = false;

        try {

            // try to resolve the module name from node modules (bare module)
            const modulePath = require.resolve(moduleName);
            const moduleExt = path.extname(modulePath).toLowerCase();
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

                // is the bundle a UI5 module?
                const moduleContent = await readFile(modulePath, { encoding: "utf8" });

                // only transform non-UI5 modules
                if (moduleExt === ".js" && !isUI5Module(moduleContent)) {

                    bundling = true;

                    // create a bundle (maybe in future we should again load the )
                    const bundle = await rollup.rollup({
                        input: moduleName,
                        plugins: [
                            nodePolyfills(),
                            nodeResolve({
                                browser: true,
                                mainFields: ["module", "main"]
                            }),
                            json(),
                            require("./rollup-skip-assets")(),
                            commonjs({
                                defaultIsModuleExports: true
                            }),
                            injectProcessEnv({
                                NODE_ENV: "production"
                            })
                        ]
                    });

                    // generate output specific code in-memory
                    // you can call this function multiple times on the same bundle object
                    const { output } = await bundle.generate({
                        output: {
                            format: "amd",
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

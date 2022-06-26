"use strict";

/* eslint-disable no-unused-vars */
const log = require("@ui5/logger").getLogger("server:custommiddleware:ui5-tooling-modules");

const path = require("path");
const { readFile } = require("fs").promises;

const rollup = require("rollup");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const nodePolyfills = require("rollup-plugin-polyfill-node");
const injectProcessEnv = require("rollup-plugin-inject-process-env");
const amdCustom = require("./rollup-plugin-amd-custom");
const skipAssets = require("./rollup-plugin-skip-assets");

const espree = require("espree");
const estraverse = require("estraverse");

// local bundle cache
const bundleCache = {};

/**
 * Checks whether the given content is a UI5 module or not
 *
 * @param {string} content the content of a JS module
 * @param {string} path the path of a JS module
 * @returns {boolean} true, if the JS module is a UI5 module
 */
function isUI5Module(content, path) {
	try {
		const program = espree.parse(content, { range: true, comment: true, tokens: true, ecmaVersion: "latest" });
		let isUI5Module = false;
		estraverse.traverse(program, {
			enter(node, parent) {
				if (
					node?.type === "CallExpression" &&
					/require|define/.test(node?.callee?.property?.name) &&
					node?.callee?.object?.property?.name == "ui" &&
					node?.callee?.object?.object?.name == "sap"
				) {
					isUI5Module = true;
				}
			},
		});
		return isUI5Module;
	} catch (err) {
		log.verbose(`Failed to parse dependency "${path}" with espree!`, err);
		return false;
	}
}

const that = (module.exports = {
	/**
	 * Resolves the bare module name from node_modules utilizing the require.resolve
	 *
	 * @param {string} moduleName name of the module (e.g. "chart.js/auto")
	 * @returns {string} the path of the module in the filesystem
	 */
	resolveModule: function resolveModule(moduleName) {
		let modulePath;
		try {
			// try the regular lookup
			modulePath = require.resolve(moduleName);
		} catch (err) {
			// gracefully ignore the error
			//console.error(err);
		}
		if (!modulePath) {
			// fallback for PNPM and/or DEBUG scenario
			try {
				// try the lookup relative to CWD
				modulePath = require.resolve(moduleName, {
					paths: [process.cwd()],
				});
			} catch (err) {
				// gracefully ignore the error
				//console.error(err);
			}
		}
		return modulePath;
	},

	/**
	 * Lookup and returns a resource from the node_modules. In case
	 * of JS modules an UI5 AMD-like bundle is being created. For
	 * UI5 modules or any other asset, just the content is being
	 * returned.
	 *
	 * @param {string} moduleName the module name
	 * @param {object} [options] additional options
	 * @param {boolean} [options.skipCache] skip the module cache
	 * @returns {string} the content of the resource or undefined
	 */
	getResource: async function getResource(moduleName, { skipCache }) {
		let bundling = false;

		try {
			const modulePath = that.resolveModule(moduleName);
			if (modulePath) {
				const moduleExt = path.extname(modulePath).toLowerCase();

				let cachedBundle = bundleCache[moduleName];
				if (skipCache || !cachedBundle) {
					// is the bundle a UI5 module?
					const moduleContent = await readFile(modulePath, { encoding: "utf8" });

					// only transform non-UI5 modules
					if (moduleExt === ".js" && !isUI5Module(moduleContent, modulePath)) {
						bundling = true;

						// create a bundle (maybe in future we should again load the )
						const bundle = await rollup.rollup({
							preserveSymlinks: true,
							input: moduleName,
							plugins: [
								skipAssets({
									extensions: ["css"],
									modules: ["crypto"],
								}),
								nodePolyfills(),
								(function (options) {
									"use strict";
									return {
										name: "resolve-pnpm",
										resolveId(source) {
											return that.resolveModule(source);
										},
									};
								})(),
								nodeResolve({
									mainFields: ["module", "main"],
								}),
								json(),
								commonjs({
									defaultIsModuleExports: true,
								}),
								amdCustom(),
								injectProcessEnv({
									NODE_ENV: "production",
								}),
							],
						});

						// generate output specific code in-memory
						// you can call this function multiple times on the same bundle object
						const { output } = await bundle.generate({
							output: {
								format: "amd",
								amd: {
									define: "sap.ui.define",
								},
							},
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
			}
		} catch (err) {
			if (bundling) {
				console.error(`Couldn't bundle ${moduleName}: ${err}`, err);
			}
		}
	},
});

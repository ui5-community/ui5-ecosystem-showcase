"use strict";

/* eslint-disable no-unused-vars */
const log = require("@ui5/logger").getLogger("server:custommiddleware:ui5-tooling-modules");

const path = require("path");
const { readFile, stat } = require("fs").promises;

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

// local ignore list
const ignoreList = [".", ".."];

// package.json of app
const pkg = require(path.join(process.cwd(), "package.json"));

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
		// ignore module paths starting with a segment from the ignore list (TODO: maybe a better check?)
		const moduleNameSegments = moduleName.split("/");
		if (ignoreList.indexOf(moduleNameSegments?.[0]) >= 0) {
			return undefined;
		}
		// special handling for app-local resources!
		if (moduleName?.startsWith(`${pkg.name}/`)) {
			return path.join(process.cwd(), moduleName.substring(`${pkg.name}/`.length) + ".js");
		}
		// resolve from node_modules
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
			const lastModified = new Date((await stat(modulePath)).mtime).getTime();
			if (modulePath) {
				const moduleExt = path.extname(modulePath).toLowerCase();

				let cachedBundle = bundleCache[moduleName];
				if (skipCache || !cachedBundle || cachedBundle.lastModified !== lastModified) {
					// is the bundle a UI5 module?
					const moduleContent = await readFile(modulePath, { encoding: "utf8" });

					// only transform non-UI5 modules
					if (moduleExt === ".js" && !isUI5Module(moduleContent, modulePath)) {
						bundling = true;

						// create a bundle
						const bundle = await rollup.rollup({
							preserveSymlinks: true,
							input: moduleName,
							plugins: [
								skipAssets({
									extensions: ["css"],
									modules: ["crypto"],
								}),
								nodePolyfills(),
								json(),
								commonjs({
									defaultIsModuleExports: true,
								}),
								amdCustom(),
								// between @rollup/plugin-node-resolve 13.3.0 and 14.0.0 something changed which leads
								// to corrupt bundles for other projects - locally in the ecosystem it seems to work.
								//
								// The following change adopted the module resolution:
								// => https://github.com/rollup/plugins/commit/886debae6b1d9f00c897c866a4c4c6975a5d47db
								//
								// TODO: check why the upgrade to version >= 14.0.0 isn't possible?
								//       - verify with the following projects with ui5-tooling-modules@0.7.2:
								//         => https://github.com/marianfoo/ui5-cc-excelUpload
								//         => https://github.com/marianfoo/gh-following-to-rss
								nodeResolve({
									browser: true,
									mainFields: ["module", "main"],
									preferBuiltins: false,
								}),
								(function (options) {
									"use strict";
									return {
										name: "resolve-pnpm",
										resolveId(source) {
											return that.resolveModule(source);
										},
									};
								})(),
								injectProcessEnv({
									NODE_ENV: "production",
								}),
							],
							onwarn: function (warning) {
								// Skip certain warnings

								// should intercept ... but doesn't in some rollup versions
								if (warning.code === "THIS_IS_UNDEFINED") {
									return;
								}

								// console.warn everything else
								console.warn(warning.message);
							},
						});

						// generate output specific code in-memory
						// you can call this function multiple times on the same bundle object
						const { output } = await bundle.generate({
							format: "amd",
							amd: {
								define: "sap.ui.define",
							},
						});

						// Right now we only support one chunk as build result
						// should be also given by the rollup configuration!
						if (output.length === 1 && output[0].type === "chunk") {
							cachedBundle = bundleCache[moduleName] = {
								content: output[0].code,
								lastModified,
							};
						} else {
							log.info(`The bundle for ${moduleName} has ${output.length} chunks!`);
							// let's take the first chunk only
							cachedBundle = bundleCache[moduleName] = {
								content: output[0].code,
								lastModified,
							};
						}
					} else {
						cachedBundle = bundleCache[moduleName] = {
							content: moduleContent,
							lastModified,
						};
					}
				}

				return cachedBundle?.content;
			}
		} catch (err) {
			if (bundling) {
				log.error(`Couldn't bundle ${moduleName}: ${err}`, err);
			}
		}
	},
});

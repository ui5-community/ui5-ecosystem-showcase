"use strict";

/* eslint-disable no-unused-vars */
const log = require("@ui5/logger").getLogger("server:custommiddleware:ui5-tooling-modules");

const path = require("path");
const { existsSync } = require("fs");
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

// local list of resolved modules (name to location)
const resolvedModules = {};

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

/**
 * Resolves the node module
 *
 * @param {string} moduleName name of the module
 * @returns {string} path of the module if found or undefined
 */
function resolveNodeModule(moduleName) {
	let modulePath;
	// resolve from node_modules via regular lookup
	try {
		modulePath = require.resolve(moduleName);
	} catch (err) {
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
		if ((resolvedModules[moduleName] && resolvedModules[moduleName].modulePath === undefined) || /^\./.test(moduleName)) {
			return undefined;
		}
		// retrieve or create a resolved module
		// (also for the modules which don't exist, as a negative cache!)
		let resolvedModule = resolvedModules[moduleName];
		if (!resolvedModule) {
			log.verbose(`Resolving ${moduleName}...`);
			// no module found => resolve it
			resolvedModule = resolvedModules[moduleName] = {};
			// resolve the module path
			if (moduleName?.startsWith(`${pkg.name}/`)) {
				// special handling for app-local resources!
				resolvedModule.modulePath = path.join(process.cwd(), moduleName.substring(`${pkg.name}/`.length) + ".js");
			} else {
				// derive the module path from the package.json entries browser, module or main
				try {
					const pckJsonModuleName = path.join(moduleName, "package.json");
					const pkgJson = require(pckJsonModuleName);
					if (typeof pkgJson?.browser === "string") {
						resolvedModule.modulePath = path.join(path.dirname(resolveNodeModule(pckJsonModuleName)), pkgJson?.browser);
					} else if (typeof pkgJson?.module === "string") {
						resolvedModule.modulePath = path.join(path.dirname(resolveNodeModule(pckJsonModuleName)), pkgJson?.module);
					} else if (typeof pkgJson?.main === "string") {
						resolvedModule.modulePath = path.join(path.dirname(resolveNodeModule(pckJsonModuleName)), pkgJson?.main);
					}
					// reset the module path if it doesn't exist
					if (!existsSync(resolvedModule.modulePath)) {
						resolvedModule.modulePath = undefined;
					}
				} catch (err) {
					// gracefully ignore the error
					//console.error(err);
				}
				// resolve from node_modules via regular lookup
				if (!resolvedModule.modulePath) {
					resolvedModule.modulePath = resolveNodeModule(moduleName);
				}
			}
			if (resolvedModule.modulePath === undefined) {
				log.verbose(`  => not found!`);
			} else {
				log.verbose(`  => found at ${resolvedModule.modulePath}`);
			}
		}
		return resolvedModule.modulePath;
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

					// only transform non-UI5 modules (.js, .mjs, .cjs files)
					if (/\.(m|c)?js/.test(moduleExt) && !isUI5Module(moduleContent, modulePath)) {
						bundling = true;

						// create a bundle
						const bundle = await rollup.rollup({
							input: moduleName,
							plugins: [
								(function (options) {
									"use strict";
									return {
										name: "logger",
										resolveId(source) {
											console.log(`Bundling resource ${source}`);
											return undefined;
										},
									};
								})(),
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
											// ignore absolute paths
											if (path.isAbsolute(source)) {
												return source;
											}
											return that.resolveModule(source);
										},
									};
								})(),
								injectProcessEnv({
									NODE_ENV: "production",
								}),
							],
							onwarn: function ({ loc, frame, code, message }) {
								// Skip certain warnings

								// should intercept ... but doesn't in some rollup versions
								if (code === "THIS_IS_UNDEFINED") {
									return;
								}

								// console.warn everything else
								if (loc) {
									log.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
									if (frame) log.warn(frame);
								} else {
									log.warn(message);
								}
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

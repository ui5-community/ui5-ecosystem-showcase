/* eslint-disable no-unused-vars */
const path = require("path");
const { existsSync } = require("fs");
const { readFile, stat } = require("fs").promises;

const rollup = require("rollup");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const nodePolyfills = require("rollup-plugin-polyfill-node");
const amdCustom = require("./rollup-plugin-amd-custom");
const skipAssets = require("./rollup-plugin-skip-assets");
const injectESModule = require("./rollup-plugin-inject-esmodule");
const logger = require("./rollup-plugin-logger");
const pnpmResolve = require("./rollup-plugin-pnpm-resolve");
const dynamicImports = require("./rollup-plugin-dynamic-imports");
const replace = require("@rollup/plugin-replace");

const espree = require("espree");
const estraverse = require("estraverse");

const walk = require("ignore-walk");
const minimatch = require("minimatch");

// local output cache of rollup
const outputCache = {};
const chunkToModulePath = {};

// local cache of negative modules (avoid additional lookups)
const modulesNegativeCache = [];

// main field processing order (for nodeResolve and resolveModule)
const defaultMainFields = ["browser", "module", "main"];

module.exports = function (log) {
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
			// try the lookup relative to CWD
			modulePath = require.resolve(moduleName, {
				paths: [process.cwd()], // necessary for PNPM and/or DEBUG scenario
			});
		} catch (err) {
			// use the default lookup
			try {
				modulePath = require.resolve(moduleName);
			} catch (err) {
				// gracefully ignore the error
				//console.error(err);
			}
		}
		return modulePath;
	}

	const that = {
		/**
		 * Resolves the bare module name from node_modules utilizing the require.resolve
		 *
		 * @param {string} moduleName name of the module (e.g. "chart.js/auto")
		 * @param {object} options configuration options
		 * @param {string[]} options.mainFields an order of main fields to check in package.json
		 * @returns {string} the path of the module in the filesystem
		 */
		// ignore module paths starting with a segment from the ignore list (TODO: maybe a better check?)
		resolveModule: function resolveModule(moduleName, { mainFields } = {}) {
			if (modulesNegativeCache.indexOf(moduleName) !== -1 || /^\./.test(moduleName)) {
				return undefined;
			}
			// package.json of app
			const pkg = require(path.join(process.cwd(), "package.json"));
			// default the mainFields
			mainFields = mainFields || defaultMainFields;
			// retrieve or create a resolved module
			log.verbose(`Resolving ${moduleName} [${mainFields}]...`);
			// no module found => resolve it
			let modulePath;
			// resolve the module path
			if (moduleName?.startsWith(`${pkg.name}/`)) {
				// special handling for app-local resources!
				modulePath = path.join(process.cwd(), moduleName.substring(`${pkg.name}/`.length) + ".js");
			} else {
				// derive the module path from the package.json entries browser, module or main
				try {
					const pckJsonModuleName = path.join(moduleName, "package.json");
					const pkgJson = require(pckJsonModuleName);
					// resolve the main field from the package.json
					for (const field of mainFields) {
						if (typeof pkgJson?.[field] === "string") {
							modulePath = path.join(path.dirname(resolveNodeModule(pckJsonModuleName)), pkgJson?.[field]);
							break;
						}
					}
					// reset the module path if it doesn't exist
					if (!existsSync(modulePath)) {
						modulePath = undefined;
					}
				} catch (err) {
					// gracefully ignore the error
					//console.error(err);
				}
				// resolve from node_modules via regular lookup
				if (!modulePath) {
					modulePath = resolveNodeModule(moduleName);
				}
			}
			if (modulePath === undefined) {
				modulesNegativeCache.push(moduleName);
				log.verbose(`  => not found!`);
			} else {
				log.verbose(`  => found at ${modulePath}`);
			}
			return modulePath;
		},

		/**
		 * creates a bundle for the given module name
		 *
		 * @param {string} moduleName name of the module (e.g. "chart.js/auto")
		 * @param {object} options configuration options
		 * @param {string[]} options.mainFields an order of main fields to check in package.json
		 * @param {boolean} [options.beforePlugins] rollup plugins to be executed before
		 * @param {boolean} [options.afterPlugins] rollup plugins to be executed after
		 * @returns {string} the bundle
		 */
		createBundle: async function createBundle(moduleName, { mainFields, beforePlugins, afterPlugins } = {}) {
			// create a bundle
			const bundle = await rollup.rollup({
				input: moduleName,
				plugins: [
					...(beforePlugins || []),
					replace({
						preventAssignment: false,
						values: {
							"process.env.NODE_ENV": JSON.stringify("development"),
						},
					}),
					injectESModule(),
					skipAssets({
						log,
						extensions: ["css"],
						modules: ["crypto"],
					}),
					commonjs({
						defaultIsModuleExports: true,
					}),
					amdCustom(),
					nodePolyfills(),
					json(),
					nodeResolve({
						mainFields,
						preferBuiltins: false,
					}),
					pnpmResolve({
						mainFields,
						resolveModule: that.resolveModule.bind(that),
					}),
					...(afterPlugins || []),
				],
				onwarn: function ({ loc, frame, code, message }) {
					// Skip certain warnings
					const skipWarnings = ["THIS_IS_UNDEFINED", "CIRCULAR_DEPENDENCY", "MIXED_EXPORTS", "MODULE_LEVEL_DIRECTIVE"];
					if (skipWarnings.indexOf(code) !== -1) {
						return;
					}
					// console.warn everything else
					if (loc) {
						log.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
						if (frame) log.warn(frame);
					} else {
						log.warn(`${message} [${code}]`);
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
				entryFileNames: `${moduleName}.js`,
				chunkFileNames: `${moduleName}-[hash].js`,
			});

			return output;
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
		 * @param {boolean} [options.debug] debug mode
		 * @param {boolean|string[]} [options.keepDynamicImports] List of NPM packages for which the dynamic imports should be kept or boolean (defaults to true)
		 * @param {boolean|string[]} [skipTransform] flag or array of globs to verify whether the module transformation should be skipped
		 * @returns {object} the output object of the resource (code, chunks?, lastModified)
		 */
		getResource: async function getResource(moduleName, { skipCache, debug, keepDynamicImports }, skipTransform) {
			let bundling = false;

			try {
				// in case of chunks are requested, we lookup the original module
				const modulePath = chunkToModulePath[moduleName] ?? that.resolveModule(moduleName);
				if (modulePath) {
					if (!existsSync(modulePath)) {
						log.error(`Bundle ${moduleName} doesn't exist at the resolved path ${modulePath}!`);
						return;
					}

					const lastModified = new Date((await stat(modulePath)).mtime).getTime();
					const moduleExt = path.extname(modulePath).toLowerCase();
					const isChunk = !!chunkToModulePath[moduleName];

					let cachedOutput = outputCache[moduleName];
					if (!isChunk && (skipCache || !cachedOutput || cachedOutput.lastModified !== lastModified)) {
						// is the bundle a UI5 module?
						const moduleContent = await readFile(modulePath, { encoding: "utf8" });

						// check whether the current resource should be skipped or not (based on module name)
						const shouldSkipTransform = Array.isArray(skipTransform)
							? skipTransform.some((value) => {
									return minimatch(moduleName, value);
							  })
							: skipTransform;

						// only transform non-UI5 modules (.js, .mjs, .cjs files)
						if (!shouldSkipTransform && /\.(m|c)?js/.test(moduleExt) && !isUI5Module(moduleContent, modulePath)) {
							bundling = true;

							// create the bundle
							let output;
							try {
								output = await that.createBundle(moduleName, {
									mainFields: defaultMainFields,
									beforePlugins: [logger({ log })],
									afterPlugins: [dynamicImports({ moduleName, keepDynamicImports })],
								});
							} catch (ex) {
								// related to issue #726 for which the generation of jspdf fails on Windows machines
								// when running the build in a standalone project with npm (without monorepo and pnpm)
								log.warn(`Failed to bundle "${moduleName}" using ES modules, falling back to CommonJS modules...`);
								log.verbose(ex); // report error in verbose case!
								output = await that.createBundle(moduleName, {
									mainFields: ["browser", "main", "module"],
									beforePlugins: [logger({ log })],
									afterPlugins: [dynamicImports({ moduleName, keepDynamicImports })],
								});
							}

							// cache the output (can be mulitple chunks)
							cachedOutput = outputCache[moduleName] = {
								code: output[0].code,
								lastModified,
							};

							// Right now we only support one chunk as build result
							// should be also given by the rollup configuration!
							if (output.length > 1) {
								debug && log.info(`The bundle for ${moduleName} has ${output.length} chunks!`);
								// cleanup the chunkToModulePath mapping for the current module
								Object.keys(chunkToModulePath).forEach((fileName) => {
									if (chunkToModulePath[fileName] === modulePath) {
										delete chunkToModulePath[fileName];
									}
								});
								// store the individual output chunks as well in the cache
								cachedOutput.chunks = {};
								output.slice(1).forEach((chunk) => {
									const fileName = chunk.fileName.substring(0, chunk.fileName.length - 3);
									cachedOutput.chunks[fileName] = outputCache[fileName] = {
										code: chunk.code,
										lastModified,
									};
									chunkToModulePath[fileName] = modulePath;
								});
							}
						} else {
							cachedOutput = outputCache[moduleName] = {
								code: moduleContent,
								lastModified,
							};
						}
					}

					return cachedOutput;
				} else {
					// try to retrieve the resource from the output cache
					// most often this is a chunk resource created in addition
					return outputCache[moduleName];
				}
			} catch (err) {
				if (bundling) {
					log.error(`Couldn't bundle ${moduleName}: ${err}`, err);
				}
			}
		},

		/**
		 * Lists all resources included in the provided NPM package filtered by the
		 * list of ignore glob patterns
		 *
		 * @param {string} npmPackageName name of the module (e.g. "chart.js/auto")
		 * @param {string[]} ignore list of globs to be ignored
		 * @returns {string[]} a list of resource paths
		 */
		listResources: function listResources(npmPackageName, ignore) {
			const npmPackageJsonPath = that.resolveModule(`${npmPackageName}/package.json`);
			if (typeof npmPackageJsonPath === "string") {
				const npmPackagePath = path.resolve(npmPackageJsonPath, "../");
				const resources = walk
					.sync({ path: npmPackagePath })
					.filter((file) => {
						return (
							!ignore ||
							ignore.filter((ignoreGlob) => {
								return !minimatch(file, ignoreGlob);
							}).length !== ignore.length
						);
					})
					.map((file) => {
						return `${npmPackageName}/${file}`;
					});
				return resources;
			} else {
				throw new Error(`NPM package ${npmPackageName} not found. Ignoring package...`);
			}
		},
	};
	return that;
};

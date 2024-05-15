/* eslint-disable no-unused-vars */
const path = require("path");
const { readFileSync, statSync, readdirSync, existsSync } = require("fs");
const { readFile, stat } = require("fs").promises;

const rollup = require("rollup");
const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const nodePolyfills = require("rollup-plugin-polyfill-node");
const nodePolyfillsOverride = require("./rollup-plugin-polyfill-node-override");
const amdCustom = require("./rollup-plugin-amd-custom");
const skipAssets = require("./rollup-plugin-skip-assets");
const injectESModule = require("./rollup-plugin-inject-esmodule");
const logger = require("./rollup-plugin-logger");
const pnpmResolve = require("./rollup-plugin-pnpm-resolve");
const dynamicImports = require("./rollup-plugin-dynamic-imports");
const replace = require("@rollup/plugin-replace");
const transformTopLevelThis = require("./rollup-plugin-transform-top-level-this");

const walk = require("ignore-walk");
const minimatch = require("minimatch");

const { XMLParser } = require("fast-xml-parser");
const parseJS = require("./parseJS");

const { createHash } = require("crypto");

/**
 * helper to check the existence of a resource (case-sensitive)
 * @param {string} file file path
 * @returns {boolean} true if the file exists
 */
function existsSyncWithCase(file) {
	var dir = path.dirname(file);
	if (dir === path.dirname(dir)) {
		return true;
	}
	var filenames = readdirSync(dir);
	if (filenames.indexOf(path.basename(file)) === -1) {
		return false;
	}
	return existsSyncWithCase(dir);
}

const nodeModulesDirCache = {};
/**
 * find the node_modules base directories in the given directory
 * @param {string} dir directory to start the search
 * @param {*} folders list of found node_modules base directories
 * @param {*} recursive flag whether search runs recursively
 * @returns {string[]} list of found node_modules base directories
 */
function findNodeModules(dir, folders = [], recursive) {
	if (!recursive && nodeModulesDirCache[dir]) {
		return nodeModulesDirCache[dir];
	} else {
		//const millis = new Date().getTime();
		const nodeModulesDir = path.join(dir, "node_modules");
		if (existsSync(nodeModulesDir)) {
			folders.push(nodeModulesDir);
			//console.log("found node_modules in " + nodeModulesDir);
			readdirSync(nodeModulesDir, { withFileTypes: true }).forEach((nodeModule) => {
				const nodeModuleName = nodeModule.name;
				const nodeModuleDir = path.join(nodeModulesDir, nodeModuleName);
				if (nodeModuleName.startsWith("@")) {
					readdirSync(nodeModuleDir, { withFileTypes: true }).forEach((scopedNodeModule) => {
						const scopedNodeModuleDir = path.join(nodeModuleDir, scopedNodeModule.name);
						if (existsSync(path.join(scopedNodeModuleDir, "package.json"))) {
							findNodeModules(scopedNodeModuleDir, folders, true);
						}
					});
				} else if (existsSync(path.join(nodeModuleDir, "package.json"))) {
					findNodeModules(nodeModuleDir, folders, true);
				}
			});
		}
		if (!recursive) {
			nodeModulesDirCache[dir] = folders;
			//console.log(`findNodeModules(${dir}) took ${new Date().getTime() - millis}ms`);
		}
		return folders;
	}
}

// local bundle info cache
const bundleInfoCache = {};
class BundleInfo {
	_entries = [];
	getEntry(name) {
		return this._entries.find((entry) => entry.name === name);
	}
	getEntries() {
		return this._entries;
	}
	addModule(entryInfo) {
		return this._entries.push(Object.assign(entryInfo, { type: "module" }));
	}
	getModules() {
		return this._entries.filter((entry) => entry.type === "module");
	}
	addChunk(entryInfo) {
		return this._entries.push(Object.assign(entryInfo, { type: "chunk" }));
	}
	getChunks() {
		return this._entries.filter((entry) => entry.type === "chunk");
	}
	addResource(entryInfo) {
		return this._entries.push(Object.assign(entryInfo, { type: "resource" }));
	}
	getResources() {
		return this._entries.filter((entry) => entry.type === "resource");
	}
	getBundledResources() {
		return this._entries.filter((entry) => /^(module|chunk|resource)$/.test(entry.type));
	}
}

// local cache of negative modules (avoid additional lookups)
const modulesNegativeCache = [];

// main field processing order (for resolveModule)
const defaultExportsFields = ["browser", "import", "require", "default"];

// main field processing order (for nodeResolve and resolveModule)
const defaultMainFields = ["browser", "module", "main"];

module.exports = function (log) {
	/**
	 * Checks whether the file behind the given path is a UI5 module or not
	 *
	 * @param {string} source the path of a JS module
	 * @returns {boolean} true, if the JS module is a UI5 module
	 */
	async function isUI5Module(source) {
		try {
			let isUI5Module = false;
			const content = await readFile(source, { encoding: "utf8" });
			if (content) {
				const { parse } = await import("@typescript-eslint/typescript-estree");
				const { walk } = await import("estree-walker");
				const program = parse(content, { jsx: path.extname(source) !== ".ts", allowInvalidAST: true });
				walk(program, {
					enter(node, parent, prop, index) {
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
			}
			return isUI5Module;
		} catch (err) {
			log.verbose(`Failed to parse dependency "${source}"!`, err);
			return false;
		}
	}

	/**
	 * Resolves the node module
	 *
	 * @param {string} moduleName name of the module
	 * @param {string} cwd current working directory
	 * @param {string[]} depPaths paths of the dependencies (in addition for cwd)
	 * @returns {string} path of the module if found or undefined
	 */
	function resolveNodeModule(moduleName, cwd = process.cwd(), depPaths = []) {
		let modulePath;
		const resolve = function (moduleName, options) {
			try {
				return require.resolve(moduleName, options);
			} catch (err) {
				// gracefully ignore the error
				//console.error(err);
			}
		};
		// try to resolve the module with different file extensions
		for (const ext of ["", ".js", ".cjs", ".mjs"]) {
			// 1.) use default lookup
			modulePath = resolve(`${moduleName}${ext}`);
			if (modulePath) break;
			// 2.) resolve from node_modules via regular lookup (try the lookup relative to CWD)
			modulePath = resolve(`${moduleName}${ext}`, {
				paths: [cwd, ...depPaths], // necessary for PNPM and/or DEBUG scenario
			});
			if (modulePath) break;
			// 3.) resolve from node_modules via regular lookup (try the lookup relative to the module)
			const nodeModulePaths = findNodeModules(cwd);
			modulePath = resolve(`${moduleName}${ext}`, {
				paths: [cwd, ...nodeModulePaths], // necessary for PNPM and/or DEBUG scenario
			});
			if (modulePath) break;
		}
		return modulePath;
	}

	const that = {
		/**
		 * scans the project resources
		 *
		 * @param {module:@ui5/fs/AbstractReader[]} reader resources reader
		 * @param {object} [config] configuration
		 * @param {boolean} [config.debug] debug mode
		 * @param {boolean} [config.providedDependencies] list of provided dependencies which should not be processed
		 * @param {object<string, string[]>} [config.includeAssets] map of assets (key: npm package name, value: local paths) to be included (embedded)
		 * @param {object} [options] additional options
		 * @param {string} [options.cwd] current working directory
		 * @param {string[]} [options.depPaths] paths of the dependencies (in addition for cwd)
		 * @returns {object} unique dependencies, resources, namespaces, chunks, ...
		 */
		scan: async function (reader, config, { cwd, depPaths }) {
			const { parse } = await import("@typescript-eslint/typescript-estree");
			const { walk } = await import("estree-walker");

			const providedDependencies = Array.isArray(config?.providedDependencies) ? config?.providedDependencies : [];

			// find all sources to determine their dependencies
			let allSources = await reader.byGlob("/**/*.{js,jsx,ts,tsx}");

			// only keep the TS resources for which no parallel JS resource exist
			// as we assume that the transpiling creates the parallel JS resource
			allSources = allSources.filter((source) => {
				const sourcePath = source.getPath();
				const ext = path.extname(sourcePath);
				if (ext !== ".js") {
					const foundJSSource = allSources.findIndex((source) => source.getPath() === `${path.basename(source.getPath())}.js`) !== -1;
					if (foundJSSource) {
						log.info(`Removing source ${sourcePath} (as a parallel JS resource was found)`);
						return false;
					}
				}
				return true;
			});

			// find all XML resources to determine their dependencies
			const allXmlResources = await reader.byGlob("/**/*.xml");

			// collector for unique dependencies and resources
			//const uniqueNPMPackages = new Set();
			const uniqueDeps = new Set();
			const uniqueModules = new Set();
			const uniqueResources = new Set();
			const uniqueNS = new Set();

			// eslint-disable-next-line jsdoc/require-jsdoc
			function isProvided(depOrRes) {
				return providedDependencies.filter((e) => depOrRes === e || depOrRes.startsWith(`${e}/`)).length > 0;
			}

			// eslint-disable-next-line jsdoc/require-jsdoc
			/* TODO: keep functionality commented till needed!
			function addUniqueNPMPackage(npmPackageName) {
				if (!uniqueNPMPackages.has(npmPackageName) && npmPackageName && !npmPackageName.startsWith(".") && resolveModule(`${npmPackageName}/package.json`, { cwd, depPaths })) {
					uniqueNPMPackages.add(npmPackageName);
				}
			}
			*/

			// eslint-disable-next-line jsdoc/require-jsdoc
			function addUniqueDep(dep) {
				if (isProvided(dep)) {
					return false;
				} else {
					// add the dependency (by default we already filter the UI5 modules we know)
					//if (!dep.startsWith("sap/")) {
					uniqueDeps.add(dep);
					//}
					// also add the NPM package name
					//const npmPackageName = /((?:@[^/]+\/)?(?:[^/]+)).*/.exec(dep)?.[1];
					//addUniqueNPMPackage(npmPackageName);
					return true;
				}
			}

			// eslint-disable-next-line jsdoc/require-jsdoc
			function addUniqueModule(module, modulePath) {
				const moduleName = module.split("/").pop();
				const moduleFileName = modulePath.split(path.sep).pop();
				// identify modules which already provide their file extension in the module name
				// => this avoids the duplication of the modules specified with and without file
				//    extension in the uniqueModules set (e.g. "myns/module" and "myns/module.js")
				if (moduleName === moduleFileName && module.endsWith(".js")) {
					//console.log(`Module name and file name are equal: ${module} => ${modulePath}`);
					module = module.slice(0, -3); // remove the file extension
				}
				uniqueModules.add(module);
			}

			// eslint-disable-next-line jsdoc/require-jsdoc
			function addUniqueResource(res) {
				if (!isProvided(res) && that.existsResource(res, { cwd, depPaths })) {
					uniqueResources.add(res);
				}
			}

			// eslint-disable-next-line jsdoc/require-jsdoc
			function addUniqueNamespace(ns) {
				if (!isProvided(ns)) {
					uniqueNS.add(ns);
				}
			}

			// eslint-disable-next-line jsdoc/require-jsdoc
			function addDep(dep) {
				if (addUniqueDep(dep)) {
					// each dependency which can be resolved via the NPM package name
					// should also be checked for its dependencies to finally handle them
					// here if they also require to be transpiled by the task
					try {
						const depPath = that.resolveModule(dep, { cwd, depPaths });
						if (depPath && existsSyncWithCase(depPath)) {
							const depContent = readFileSync(depPath, { encoding: "utf8" });
							addUniqueModule(dep, depPath);
							findUniqueJSDeps(depContent, depPath);
						}
					} catch (ex) {
						/* noop */
					}
				}
			}

			// utility to lookup unique JS dependencies
			// eslint-disable-next-line jsdoc/require-jsdoc
			function findUniqueJSDeps(content, parentDepPath) {
				// use @typescript-eslint/typescript-estree to parse the UI5 modules
				// and extract the UI5 module dependencies
				//   => can parse modern JS, TS, JSX, and TSX syntax
				//      => supports the ES6 import/export syntax
				//      => supports the UI5 sap.ui.require.toUrl and sap.ui.require/define/requireSync
				try {
					const program = parse(content, { jsx: path.extname(parentDepPath) !== ".ts", allowInvalidAST: true });
					walk(program, {
						enter(node, parent, prop, index) {
							if (
								/* sap.ui.require.toUrl */
								node?.type === "CallExpression" &&
								node?.callee?.property?.name == "toUrl" &&
								node?.callee?.object?.property?.name == "require" &&
								node?.callee?.object?.object?.property?.name == "ui" &&
								node?.callee?.object?.object?.object?.name == "sap"
							) {
								const elDep = node.arguments[0];
								if (elDep?.type === "Literal") {
									addUniqueResource(elDep.value);
								}
							} else if (
								/* sap.ui.(require|define) */
								(node?.type === "CallExpression" &&
									/require|define|requireSync/.test(node?.callee?.property?.name) &&
									node?.callee?.object?.property?.name == "ui" &&
									node?.callee?.object?.object?.name == "sap") ||
								/* __ui5_require_async (babel-plugin-transform-modules-ui5) */
								(node?.type === "CallExpression" && node?.callee?.name == "__ui5_require_async")
							) {
								let deps;
								if (/requireSync/.test(node?.callee?.property?.name) || /__ui5_require_async/.test(node?.callee?.name)) {
									const elDep = node.arguments[0];
									if (elDep?.type === "Literal") {
										deps = [elDep.value];
									}
								} else {
									const depsArray = node.arguments.filter((arg) => arg.type === "ArrayExpression");
									deps = depsArray?.[0]?.elements.filter((el) => el.type === "Literal").map((el) => el.value);
								}
								deps?.forEach((dep) => addDep(dep));
							} else if (
								/* ES6 dynamic import */
								node?.type === "ImportExpression"
							) {
								addDep(node.source.value);
							} else if (node?.type === "ImportDeclaration") {
								/* ES6 import */
								addDep(node.source.value);
							}
						},
					});
				} catch (err) {
					config.debug && log.warn(`Failed to analyze resource "${parentDepPath}" (${err})!${config.debug === "verbose" ? `\n${err.stack}` : ""}`);
				}
			}

			// utility to lookup unique XML dependencies
			// eslint-disable-next-line jsdoc/require-jsdoc
			function findUniqueXMLDeps(node, ns = {}, imports = {}) {
				if (typeof node === "object") {
					// attributes
					Object.keys(node)
						.filter((key) => key.startsWith("@_"))
						.forEach((key) => {
							const nsParts = /@_xmlns(?::(.*))?/.exec(key);
							if (nsParts) {
								// namespace (default namespace => "")
								ns[nsParts[1] || ""] = node[key];
								return;
							}
							const requireParts = /@_(?:(.*):)?require/.exec(key);
							if (requireParts && ns[requireParts[1]] === "sap.ui.core") {
								try {
									const requires = parseJS(node[key]);
									Object.values(requires).forEach((dep) => addDep(dep));
								} catch (err) {
									log.error(`Failed to parse the "${node[key]}" as JS object!`);
								}
								return;
							}
							const importsParts = /@_(.*):import?/.exec(key);
							if (importsParts) {
								imports[importsParts[1]] = node[key];
								addUniqueNamespace(node[key]);
								return;
							}
						});
					// nodes
					Object.keys(node)
						.filter((key) => !key.startsWith("@_"))
						.forEach((key) => {
							const children = Array.isArray(node[key]) ? node[key] : [node[key]];
							children.forEach((child) => {
								const nodeParts = /(?:([^:]*):)?(.*)/.exec(key);
								if (nodeParts) {
									// skip #text nodes
									let module = nodeParts[2];
									if (module !== "#text") {
										// only add those dependencies whose namespace is known
										let namespace = ns[nodeParts[1] || ""];
										if (typeof namespace === "string") {
											namespace = namespace.replace(/\./g, "/");
											addUniqueNamespace(namespace);
											const importPath = imports[nodeParts[1]];
											const dep = `${importPath || namespace}/${module}`;
											addDep(dep);
										}
										if (typeof child === "object") {
											findUniqueXMLDeps(child, ns, imports);
										}
									}
								}
							});
						});
				}
			}

			// lookup all resources for their dependencies via the above utility
			if (allXmlResources.length > 0) {
				const parser = new XMLParser({
					attributeNamePrefix: "@_",
					ignoreAttributes: false,
					ignoreNameSpace: false,
				});

				await Promise.all(
					allXmlResources.map(async (resource) => {
						log.verbose(`Processing XML resource: ${resource.getPath()}`);

						const content = await resource.getString();
						const xmldom = parser.parse(content);
						findUniqueXMLDeps(xmldom);

						return resource;
					})
				);
			}

			// lookup all sources for their dependencies via the above utility
			await Promise.all(
				allSources.map(async (resource) => {
					log.verbose(`Processing source: ${resource.getPath()}`);

					const content = await resource.getString();
					findUniqueJSDeps(content, resource.getPath());

					return resource;
				})
			);

			// lookup the assets to be included which are configured in the ui5.yaml
			if (config.includeAssets) {
				if (typeof config.includeAssets === "object") {
					Object.keys(config.includeAssets).forEach((npmPackageName) => {
						const ignore = config.includeAssets[npmPackageName];
						if (!ignore || Array.isArray(ignore)) {
							log.verbose(`Including assets for dependency: ${npmPackageName}`);
							try {
								const assets = that.listResources(npmPackageName, { cwd, depPaths, ignore });
								if (log.isLevelEnabled("verbose")) {
									assets.forEach((asset) => log.verbose(`  - ${asset}`));
								}
								assets.forEach((asset) => uniqueResources.add(asset));
							} catch (ex) {
								log.error(`The npm package ${npmPackageName} defined in "includeAssets" not found! Skipping assets...`);
							}
						} else {
							log.error(`The option "includeAssets" must be type of map with the key being a npm package name and optionally values being a list of glob patterns!`);
						}
					});
				} else {
					log.error(`The option "includeAssets" must be type of map with the key being a npm package name!`);
				}
			}

			return {
				uniqueDeps,
				uniqueModules,
				uniqueResources,
				uniqueNS,
				sourceFiles: [].concat(allSources, allXmlResources).map((res) => {
					return res.getSourceMetadata().fsPath;
				}),
			};
		},
		/**
		 * Resolves the bare module name from node_modules utilizing the require.resolve
		 *
		 * @param {string} moduleName name of the module (e.g. "chart.js/auto")
		 * @param {object} options configuration options
		 * @param {string} options.cwd current working directory
		 * @param {string[]} options.depPaths paths of the dependencies (in addition for cwd)
		 * @param {string[]} options.mainFields an order of main fields to check in package.json
		 * @param {string[]} options.exportsFields an order of exports fields to check in package.json
		 * @returns {string} the path of the module in the filesystem
		 */
		// ignore module paths starting with a segment from the ignore list (TODO: maybe a better check?)
		resolveModule: function resolveModule(moduleName, { cwd, depPaths, mainFields, exportsFields } = {}) {
			// default the current working directory
			cwd = cwd || process.cwd();
			// if a module is listed in the negative cache, we ignore it!
			if (modulesNegativeCache.indexOf(moduleName) !== -1 || /^\./.test(moduleName)) {
				return undefined;
			}
			// package.json of app
			const pkg = require(path.join(cwd, "package.json"));
			// default the mainFields and exportsFields
			mainFields = mainFields || defaultMainFields;
			exportsFields = exportsFields || defaultExportsFields;
			// retrieve or create a resolved module
			log.verbose(`Resolving ${moduleName} [${mainFields}]...`);
			// no module found => resolve it
			let modulePath;
			// resolve the module path
			if (moduleName?.startsWith(`${pkg.name}/`)) {
				// special handling for app-local resources!
				modulePath = path.join(cwd, moduleName.substring(`${pkg.name}/`.length) + ".js");
			} else {
				// derive the module path from the package.json entries browser, module or main
				try {
					const pckJsonModuleName = path.join(moduleName, "package.json");
					const pkgJson = require(pckJsonModuleName);
					const existsAndIsFile = function (file) {
						return existsSyncWithCase(file) && statSync(file).isFile();
					};
					const resolveModulePath = function (exports, fields) {
						for (const field of fields) {
							if (typeof exports[field] === "string") {
								modulePath = path.join(path.dirname(resolveNodeModule(pckJsonModuleName, cwd, depPaths)), exports[field]);
								// check for the module path exists and to be a file
								if (existsAndIsFile(modulePath)) {
									return modulePath;
								} else if (existsAndIsFile(`${modulePath}.js`)) {
									return `${modulePath}.js`;
								} else if (existsAndIsFile(`${modulePath}.cjs`)) {
									return `${modulePath}.cjs`;
								} else if (existsAndIsFile(`${modulePath}.mjs`)) {
									return `${modulePath}.mjs`;
								}
								// reset the module path if it doesn't exist
								modulePath = undefined;
							}
						}
					};
					// resolve the module path from exports information
					// 1.) the browser field in package.json > exports > "."
					if (typeof pkgJson?.exports?.["."] === "object" && typeof pkgJson?.exports?.["."].browser === "object") {
						modulePath = resolveModulePath(pkgJson.exports["."].browser, exportsFields);
					}
					// 2.) the browser field in package.json
					if (!modulePath) {
						modulePath = resolveModulePath(pkgJson, ["browser"]);
					}
					// 3.) the fields in package.json > exports > "."
					if (!modulePath && typeof pkgJson?.exports?.["."] === "object") {
						Object.values(pkgJson?.exports?.["."]).forEach((entry) => {
							if (!modulePath && typeof entry === "object") {
								modulePath = resolveModulePath([entry, exportsFields]);
							}
						});
						if (!modulePath) {
							modulePath = resolveModulePath([pkgJson?.exports?.["."], exportsFields]);
						}
					}
					// 4.) the fields in package.json
					if (!modulePath) {
						modulePath = resolveModulePath(pkgJson, mainFields);
					}
				} catch (err) {
					// gracefully ignore the error
					//console.error(err);
				}
				// resolve from node_modules via regular lookup
				if (!modulePath) {
					modulePath = resolveNodeModule(moduleName, cwd, depPaths);
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
		 * creates a bundle for the given module(s) using rollup
		 *
		 * @param {string|string[]} moduleNames name of the module (e.g. "chart.js/auto") or an array of module names
		 * @param {object} config configuration options
		 * @param {string} config.cwd current working directory
		 * @param {string[]} config.depPaths paths of the dependencies (in addition for cwd)
		 * @param {string[]} config.mainFields an order of main fields to check in package.json
		 * @param {rollup.InputPluginOption[]} [config.beforePlugins] rollup plugins to be executed before
		 * @param {rollup.InputPluginOption[]} [config.afterPlugins] rollup plugins to be executed after
		 * @param {string} [config.generatedCode] ES compatibility of the generated code (es5, es2015)
		 * @param {object} [config.inject] the inject configuration for @rollup/plugin-inject
		 * @param {boolean} [config.isMiddleware] flag if the getResource is called by the middleware
		 * @returns {rollup.RollupOutput} the build output of rollup
		 */
		createBundle: async function createBundle(moduleNames, { cwd, depPaths, mainFields, beforePlugins, afterPlugins, generatedCode, inject, isMiddleware } = {}) {
			const bundle = await rollup.rollup({
				input: moduleNames,
				//context: "exports" /* this is normally converted to undefined, but should be exports in our case! */,
				context: "this",
				plugins: [
					...(beforePlugins || []),
					replace({
						preventAssignment: false,
						delimiters: ["\\b", "\\b"],
						values: {
							"process.env.NODE_ENV": JSON.stringify(isMiddleware ? "development" : "production"),
							"process.versions.node": JSON.stringify("18.15.0"), // needed for some modules to select features
						},
					}),
					injectESModule(),
					skipAssets({
						log,
						extensions: ["css"],
					}),
					json(),
					commonjs({
						defaultIsModuleExports: true,
					}),
					amdCustom(),
					// node polyfills/resolution must happen after
					// commonjs and amd to ensure e.g. exports is
					// properly handled by those plugins
					nodePolyfillsOverride({
						log,
						cwd,
					}),
					nodePolyfills(),
					nodePolyfillsOverride.inject(inject),
					pnpmResolve({
						resolveModule: function (moduleName) {
							return that.resolveModule(moduleName, { cwd, depPaths, mainFields });
						},
					}),
					transformTopLevelThis({ log }),
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
				generatedCode,
				chunkFileNames: (chunkInfo) => {
					let { name } = chunkInfo;
					let match = /^_?_polyfill-(.*)$/.exec(name);
					name = match?.[1] || name;
					return `${name}.js`;
				},
				sourcemap: false, // isMiddleware ? "inline" : true
			});

			return output;
		},

		/**
		 * Returns the bundle information for all the provided module names.
		 * The modules are looked up in the node_modules and are finally
		 * converted into UI5 AMD-like modules. The build produces chunks
		 * and modules which are returned as bundling information.
		 *
		 * @param {string|string[]} moduleNames name of the module (e.g. "chart.js/auto") or an array of module names
		 * @param {object} [config] configuration
		 * @param {boolean} [config.skipCache] skip the module cache
		 * @param {boolean} [config.debug] debug mode
		 * @param {boolean|string[]} [config.skipTransform] flag or array of globs to verify whether the module transformation should be skipped
		 * @param {boolean|string[]} [config.keepDynamicImports] List of NPM packages for which the dynamic imports should be kept or boolean (defaults to true)
		 * @param {string} [config.generatedCode] ES compatibility of the generated code (es5, es2015)
		 * @param {string} [config.minify] minify the code generated by rollup
		 * @param {object} [config.inject] the inject configuration for @rollup/plugin-inject
		 * @param {object} [options] additional options
		 * @param {string} [options.cwd] current working directory
		 * @param {string[]} [options.depPaths] paths of the dependencies (in addition for cwd)
		 * @param {boolean} [options.isMiddleware] flag if the getResource is called by the middleware
		 * @returns {object} the output object of the resource (code, chunks?, lastModified)
		 */
		getBundleInfo: async function getBundleInfo(moduleNames, { skipCache, debug, skipTransform, keepDynamicImports, generatedCode, minify, inject } = {}, { cwd, depPaths, isMiddleware } = {}) {
			cwd = cwd || process.cwd();

			let bundling = false;
			let bundleInfo = new BundleInfo();

			try {
				// convert the single module request to an array
				if (typeof moduleNames === "string") {
					moduleNames = [moduleNames];
				}

				// check whether the current resource should be skipped or not (based on module name)
				const shouldSkipTransform = function (moduleName) {
					return Array.isArray(skipTransform)
						? skipTransform.some((value) => {
								return minimatch(moduleName, value);
						  })
						: skipTransform;
				};

				// determine the list of modules to transpile and get the latest lastModified
				// flag to determine when we finally need to rebuild the bundle information
				let lastModified = -1;
				for (const moduleName of moduleNames) {
					const modulePath = that.resolveModule(moduleName, { cwd, depPaths });
					// the following must apply:
					//   1) resolved from node_modules
					//   2) .js, .cjs, or .mjs file extension
					//   3) should not be skipped from transformation
					//   4) is no UI5 module
					if (modulePath) {
						if (/\.(m|c)?js/.test(path.extname(modulePath).toLowerCase()) && !shouldSkipTransform(moduleName) && !(await isUI5Module(modulePath))) {
							const module = bundleInfo.addModule({
								name: moduleName,
								path: modulePath,
								lastModified: new Date((await stat(modulePath)).mtime).getTime(),
							});
							lastModified = Math.max(lastModified, module.lastModified);
						} else {
							bundleInfo.addResource(that.getResource(moduleName, { cwd, depPaths }));
						}
					}
				}

				// create a cache key which includes the last modified timestamp and the module names
				const cacheKey = createHash("md5")
					.update(`${lastModified}:${moduleNames.sort().join(",")}`)
					.digest("hex");

				// if modules have been found, we bundle them all in one
				const modules = bundleInfo.getModules();
				if (modules.length > 0) {
					// check whether the module should be built?
					if (skipCache || !bundleInfoCache[cacheKey]) {
						bundling = true;

						// bundle the given modules
						const options = {
							cwd,
							depPaths,
							mainFields: defaultMainFields,
							beforePlugins: [logger({ log })],
							afterPlugins: [],
							generatedCode,
							minify,
							inject,
							isMiddleware,
						};
						if (modules.length === 1) {
							options.afterPlugins.push(dynamicImports({ moduleName: modules[0].name, keepDynamicImports }));
						}
						if (minify) {
							options.afterPlugins.push(require("@rollup/plugin-terser")());
						}
						const nameOfModules = modules.map((module) => module.name);
						let output;
						try {
							output = await that.createBundle(nameOfModules, options);
						} catch (ex) {
							// related to issue #726 for which the generation of jspdf fails on Windows machines
							// when running the build in a standalone project with npm (without monorepo and pnpm)
							/* debug && */ log.warn(`Failed to bundle "${nameOfModules}" using ES modules, falling back to CommonJS modules...`);
							debug && log.verbose(ex); // report error in verbose case!
							output = await that.createBundle(
								nameOfModules,
								Object.assign({}, options, {
									mainFields: ["browser", "main", "module"],
								})
							);
						}

						// parse the rollup build result
						output.forEach((module, i) => {
							// lookup the output module in the list of input modules
							const resolvedModule = modules.find((mod) => mod.path === module?.facadeModuleId?.replace(/\?.*$/, ""));
							if (resolvedModule) {
								// entry module
								resolvedModule.code = module.code;
							} else {
								// chunk module
								if (module.code) {
									// find the module to which the chunk primarily belongs
									const referencedModuleIndex = output.findIndex((m) => m.isEntry && m.imports?.indexOf(module.fileName) !== -1);
									const referencedModule = modules[Math.max(referencedModuleIndex, 0)];
									const fileName = module.fileName.substring(0, module.fileName.length - 3);
									bundleInfo.addChunk({
										name: `${referencedModule.name}/${fileName}`,
										originalName: fileName,
										code: module.code,
									});
								} else if (module.source) {
									// should never occur!
									console.error(`Found should never occur module: ${module}`);
								}
							}
						});

						// utility to fix the relative paths of the chunk imports
						const fixImports = (bundleInfo) => {
							bundleInfo.getEntries().forEach((module) => {
								const moduleName = module.name;
								const relativePath = path.relative(`/${path.dirname(moduleName)}`, "/").replace(/\\/g, "/");
								bundleInfo.getChunks().forEach((chunk) => {
									const originalChunkName = chunk.originalName;
									const chunkName = chunk.name;
									module.code = module.code?.replace(`'./${originalChunkName}'`, `'${relativePath || "."}/${chunkName}'`);
									module.code = module.code?.replace(`"./${originalChunkName}"`, `"${relativePath || "."}/${chunkName}"`);
								});
							});
							return bundleInfo;
						};

						// cache the output
						bundleInfoCache[cacheKey] = fixImports(bundleInfo);
					} else {
						// retrieve the cached output
						bundleInfo = bundleInfoCache[cacheKey];
					}
				}
			} catch (err) {
				if (bundling) {
					log.error(`Couldn't bundle ${moduleNames}: ${err}`, err);
				}
				bundleInfo.error = err;
			}
			return bundleInfo;
		},

		/**
		 * Lookup and returns a resource from the node_modules.
		 *
		 * @param {string} resourceName the resource name
		 * @param {object} [options] additional options
		 * @param {string} [options.cwd] current working directory
		 * @param {string[]} [options.depPaths] paths of the dependencies (in addition for cwd)
		 * @param {boolean} [options.isMiddleware] flag if the getResource is called by the middleware
		 * @returns {undefined|string} the content of the resource or undefined if not found
		 */
		getResource: function getResource(resourceName, { cwd, depPaths, isMiddleware }) {
			const resourcePath = that.resolveModule(`${resourceName}`, { cwd, depPaths });
			if (typeof resourcePath === "string" && existsSync(resourcePath)) {
				let code;
				return {
					name: resourceName,
					path: resourcePath,
					code: readFileSync(resourcePath, {
						encoding: "utf8",
					}),
				};
			} else if (!isMiddleware) {
				log.error(`Resource ${resourceName} not found. Ignoring resource...`);
			}
		},

		/**
		 * Check the existence of a resource in the node_modules
		 *
		 * @param {string} resourceName the resource name
		 * @param {object} [options] additional options
		 * @param {string} [options.cwd] current working directory
		 * @param {string[]} [options.depPaths] paths of the dependencies (in addition for cwd)
		 * @param {boolean} [options.onlyFiles] true, if only files should be checked
		 * @returns {boolean} true, if the resource exists (as a folder or file)
		 */
		existsResource: function existsResource(resourceName, { cwd, depPaths, onlyFiles }) {
			// try to lookup the resource in the node_modules first
			const parts = /((?:@[^/]+\/)?(?:[^/]+))(.*)/.exec(resourceName);
			if (parts) {
				const [, npmPackageName, packagePath] = /((?:@[^/]+\/)?(?:[^/]+))(.*)/.exec(resourceName);
				const npmPackagePath = that.resolveModule(`${npmPackageName}/package.json`, { cwd, depPaths });
				if (typeof npmPackagePath === "string") {
					const resourcePath = path.join(path.dirname(npmPackagePath), packagePath);
					return existsSyncWithCase(resourcePath) && (!onlyFiles || statSync(resourcePath).isFile());
				}
			}
			// resolve the module via the default lookup
			const resourcePath = that.resolveModule(`${resourceName}`, { cwd, depPaths });
			return typeof resourcePath === "string";
		},

		/**
		 * Lists all resources included in the provided NPM package filtered by the
		 * list of ignore glob patterns
		 *
		 * @param {string} npmPackageName name of the module (e.g. "chart.js/auto")
		 * @param {object} [options] additional options
		 * @param {string} [options.cwd] current working directory
		 * @param {string[]} [options.depPaths] paths of the dependencies (in addition for cwd)
		 * @param {string[]} [options.ignore] list of globs to be ignored
		 * @returns {string[]} a list of resource paths
		 */
		listResources: function listResources(npmPackageName, { cwd, depPaths, ignore }) {
			const npmPackageJsonPath = that.resolveModule(`${npmPackageName}/package.json`, { cwd, depPaths });
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

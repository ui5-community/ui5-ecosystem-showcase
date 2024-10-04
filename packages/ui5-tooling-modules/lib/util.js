/* eslint-disable no-unused-vars */
const path = require("path");
const { readFileSync, statSync, readdirSync, existsSync, realpathSync } = require("fs");
const { readFile, stat, writeFile, mkdir } = require("fs").promises;

const rollup = require("rollup");
const instructions = require("./rollup-plugin-instructions");
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
const webcomponents = require("./rollup-plugin-webcomponents");

const walk = require("ignore-walk");
const minimatch = require("minimatch");

const { XMLParser } = require("fast-xml-parser");
const parseJS = require("./utils/parseJS");

const { createHash } = require("crypto");
const sanitize = require("sanitize-filename");

const { runInContext, createContext } = require("vm");

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
	if (existsSync(dir)) {
		var filenames = readdirSync(dir);
		if (filenames.indexOf(path.basename(file)) === -1) {
			return false;
		}
		return existsSyncWithCase(dir);
	}
	return false;
}

/**
 * helper to check the existence of a "file" resource (case-sensitive)
 * @param {string} file file path
 * @returns {boolean} true if the file exists
 */
function existsSyncWithCaseAndIsFile(file) {
	return existsSyncWithCase(file) && statSync(file).isFile();
}

/**
 * helper to check the existence of a "file" resource
 * @param {string} file file path
 * @returns {boolean} true if the file exists
 */
function existsSyncAndIsFile(file) {
	return existsSync(file) && statSync(file).isFile();
}

/**
 * returns the module path with the proper file extension
 * @param {string} modulePath module path
 * @returns {string} the module path with the proper file extension
 */
function getModulePathWithExtension(modulePath) {
	// check for the module path exists and to be a file
	if (existsSyncWithCaseAndIsFile(modulePath)) {
		return modulePath;
	} else if (existsSyncWithCaseAndIsFile(`${modulePath}.js`)) {
		return `${modulePath}.js`;
	} else if (existsSyncWithCaseAndIsFile(`${modulePath}.cjs`)) {
		return `${modulePath}.cjs`;
	} else if (existsSyncWithCaseAndIsFile(`${modulePath}.mjs`)) {
		return `${modulePath}.mjs`;
	}
	// reset the module path if it doesn't exist
	return undefined;
}

/**
 * detects the "node_modules" directories relative to the current working directory
 * @param {string} cwd current working directory
 * @returns {string[]} list of existing node_modules directories
 */
function detectNodeModulesPaths(cwd = process.cwd()) {
	const nodeModules = [];
	let dir = cwd;
	while (dir !== path.dirname(dir)) {
		const nm = path.join(dir, "node_modules");
		if (existsSync(nm)) {
			nodeModules.push(nm);
		}
		dir = path.dirname(dir);
	}
	return nodeModules;
}

/**
 * resolves the module name by testing file extensions
 * @param {string} moduleName the module name
 * @param {object} options options for require.resolve
 * @param {string[]} options.paths paths to lookup the module
 * @returns {string} the resolved module path
 */
function resolve(moduleName, options) {
	let modulePath,
		errors = [];
	// try to resolve the module path with the default extensions
	for (const ext of ["", ".js", ".cjs", ".mjs"]) {
		try {
			modulePath = require.resolve(`${moduleName}${ext}`, options);
			if (modulePath) {
				break;
			}
		} catch (err) {
			errors.push(err);
		}
	}
	// if an error occurred and the module path is still undefined, we throw the error
	if (modulePath === undefined && errors.length > 0) {
		throw errors.shift(); // throw the first error only
	}
	// if the module is a built-in module, we ignore it
	if (modulePath === moduleName) {
		modulePath = undefined;
		const err = new Error(`Found built-in module "${moduleName}". Ignoring and trigger manual resolution to find custom modules!`);
		err.code = "ERR_BUILTIN_MODULE";
		throw err;
	}
	return modulePath;
}

// regex to extract the NPM package name from a dependency
const npmPackageScopeRegEx = /^((?:(@[^/]+)\/)?([^/]+))(?:\/(.*))?$/;

/**
 * find the dependency by its name
 * @param {string} dep name of the dependency
 * @param {string} cwd current working directory
 * @param {string[]} depPaths list of dependency paths
 * @returns {string} the module path
 */
function findDependency(dep, cwd = process.cwd(), depPaths = []) {
	let modulePath;
	try {
		modulePath = resolve(dep, { paths: [cwd, ...depPaths] });
	} catch (err) {
		// if the module is not exported, we try to resolve it manually
		const [, npmPackage, , , module] = npmPackageScopeRegEx.exec(dep) || [];
		if (err.code === "ERR_PACKAGE_PATH_NOT_EXPORTED" || err.code === "ERR_BUILTIN_MODULE") {
			// the node_modules path of the dependency are importan as require.resolve.paths
			// returns the node_modules paths relative to the location of this module
			for (const resolvePath of [...detectNodeModulesPaths(cwd), ...(require.resolve.paths(npmPackage) || [])]) {
				modulePath = path.join(resolvePath, npmPackage);
				if (module) {
					modulePath = path.join(modulePath, module);
				}
				if (!existsSyncAndIsFile(modulePath)) {
					modulePath = undefined;
				} else {
					// resolve the symlink to the real path
					// the check for symlink is not working
					// therefore we always resolve the real path
					modulePath = realpathSync(modulePath);
					break;
				}
			}
		} else {
			// ignoring the error
			//console.error(`Failed to find dependency ${dep} due to ${err.code}`, ex);
		}
	}
	return modulePath;
}

/**
 * find the dependencies of the current project and its transitive dependencies
 * (excluding devDependencies and providedDependencies)
 * @param {string} cwd current working directory
 * @param {string[]} depPaths list of dependency paths
 * @param {string[]} knownDeps list of known dependencies
 * @returns {string[]} array of dependency root directories
 */
function findDependencies(cwd = process.cwd(), depPaths = [], knownDeps = []) {
	const pkgJson = JSON.parse(readFileSync(path.join(cwd, "package.json"), { encoding: "utf8" }));
	const dependencies = Object.keys(pkgJson.dependencies || {});
	const depRoots = [];
	for (const dep of dependencies) {
		const npmPackage = npmPackageScopeRegEx.exec(dep)?.[1];
		if (knownDeps.indexOf(npmPackage) !== -1) {
			continue;
		}
		knownDeps.push(npmPackage);
		const depPath = findDependency(path.posix.join(npmPackage, "package.json"), cwd, depPaths);
		let depRoot = depPath && path.dirname(depPath);
		if (depRoot && depRoots.indexOf(depRoot) === -1) {
			depRoots.push(depRoot);
			depRoots.push(...findDependencies(depRoot, depPaths, knownDeps));
		}
	}
	return depRoots;
}

/**
 * bundle info object containing all entries
 */
class BundleInfoCache {
	static #bundleInfoCache = {};
	static #cachePath(key) {
		return path.join(process.cwd(), ".ui5-tooling-modules", `${key}.bundleinfo.json`);
	}
	static get(key, { persist } = {}) {
		if (this.#bundleInfoCache[key]) {
			return this.#bundleInfoCache[key];
		} else if (persist) {
			const bundleInfoPath = this.#cachePath(key);
			if (existsSync(bundleInfoPath)) {
				return (this.#bundleInfoCache[key] = new BundleInfo().fromJSON(readFileSync(bundleInfoPath, { encoding: "utf8" })));
			}
		}
		return undefined;
	}
	static store(key, bundleInfo, { persist } = {}) {
		this.#bundleInfoCache[key] = bundleInfo;
		if (persist) {
			const bundleInfoPath = this.#cachePath(key);
			mkdir(path.dirname(bundleInfoPath), { recursive: true })
				.then(() => {
					return writeFile(bundleInfoPath, JSON.stringify(bundleInfo, null, 2), { encoding: "utf8" });
				})
				.catch((err) => {
					console.error(`Failed to store bundle info in ${bundleInfoPath} on disk! Using in-memory cache only!`, err);
				});
		}
	}
}
/**
 * bundle info object containing all entries
 */
class BundleInfo {
	_entries = [];
	fromJSON(s) {
		this._entries = JSON.parse(s)._entries;
		return this;
	}
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

// local cache of resolved module paths
const modulesCache = {};

// local cache of negative modules (avoid additional lookups)
const modulesNegativeCache = [];

// the utiltiy module
module.exports = function (log, projectInfo) {
	/**
	 * Checks whether the file behind the given path is a module to skip for transformation or not
	 * @param {string} source the path of a JS module
	 * @returns {boolean} true, if the module should be skipped for transformation
	 */
	async function shouldSkipModule(source) {
		let m = Date.now();
		let isUI5Module = false;
		let isSystemJSModule = false;
		const content = await readFile(source, { encoding: "utf8" });
		if (content) {
			try {
				const context = createContext({
					sap: {
						ui: {
							require: () => {
								isUI5Module = true;
							},
							define: () => {
								isUI5Module = true;
							},
						},
					},
					System: {
						register: () => {
							isSystemJSModule = true;
						},
					},
				});
				runInContext(content, context);
			} catch (err) {
				// ESM, CJS, AMD, UMD, etc. modules should not be skipped
				log.verbose(`Failed to detect module type for "${source}"!`, err.message);
			}
		}
		log.verbose(`shouldSkipModule took ${Date.now() - m}ms`);
		return isUI5Module || isSystemJSModule;
	}

	const that = {
		/**
		 * scans the project resources
		 * @param {module:@ui5/fs/AbstractReader[]} reader resources reader
		 * @param {object} [config] configuration
		 * @param {boolean} [config.debug] debug mode
		 * @param {boolean} [config.providedDependencies] list of provided dependencies which should not be processed
		 * @param {object<string, string[]>} [config.includeAssets] map of assets (key: npm package name, value: local paths) to be included (embedded)
		 * @param {boolean} [config.legacyDependencyResolution] includes all dependencies (including devDependencies) for entry point resolution
		 * @param {object} [options] additional options
		 * @param {string} [options.cwd] current working directory
		 * @param {string[]} [options.depPaths] paths of the dependencies (in addition for cwd)
		 * @returns {object} unique dependencies, resources, namespaces, chunks, ...
		 */
		scan: async function (reader, config, { cwd = process.cwd(), depPaths = [] }) {
			const { parse } = await import("@typescript-eslint/typescript-estree");
			const { walk } = await import("estree-walker");

			const providedDependencies = Array.isArray(config?.providedDependencies) ? config?.providedDependencies : [];

			// find the root directories of the dependencies (excludes devDependencies)
			// since all modules should be declared as dependencies in the package.json
			let millis = Date.now();
			const dependencyRoots = !config?.legacyDependencyResolution && findDependencies(cwd, depPaths);
			log.verbose(`Dependency (${depPaths.length} deps) lookup took ${Date.now() - millis}ms`);

			// find all sources to determine their dependencies
			millis = Date.now();
			let allSources = await reader.byGlob("/**/*.{js,jsx,ts,tsx}");
			log.verbose(`Source (${allSources.length} files) lookup took ${Date.now() - millis}ms`);

			// only keep the TS resources for which no parallel JS resource exist
			// as we assume that the transpiling creates the parallel JS resource
			millis = Date.now();
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
			log.verbose(`JS filter took ${Date.now() - millis}ms`);

			// find all XML resources to determine their dependencies
			millis = Date.now();
			const allXmlResources = await reader.byGlob("/**/*.xml");
			log.verbose(`XML (${allXmlResources.length} files) lookup took ${Date.now() - millis}ms`);

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

			/* TODO: keep functionality commented till needed!
			function addUniqueNPMPackage(npmPackageName) {
				if (!uniqueNPMPackages.has(npmPackageName) && npmPackageName && !npmPackageName.startsWith(".") && resolveModule(`${npmPackageName}/package.json`, { cwd, depPaths })) {
					uniqueNPMPackages.add(npmPackageName);
				}
			}
			*/

			// eslint-disable-next-line jsdoc/require-jsdoc
			function addUniqueDep(dep) {
				if (uniqueDeps.has(dep) || isProvided(dep)) {
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
				if (!uniqueModules.has(module)) {
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
			}

			// eslint-disable-next-line jsdoc/require-jsdoc
			function addUniqueResource(res) {
				if (!uniqueResources.has(res) && !isProvided(res) && that.existsResource(res, { cwd, depPaths })) {
					uniqueResources.add(res);
				}
			}

			// eslint-disable-next-line jsdoc/require-jsdoc
			function addUniqueNamespace(ns) {
				if (!uniqueNS.has(ns) && !isProvided(ns)) {
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
						const existsDep = depPath && existsSyncWithCase(depPath);
						const allowedDep = existsDep && (!dependencyRoots || dependencyRoots.some((root) => depPath.startsWith(root)));
						if (allowedDep) {
							// add the dependency to the list of unique dependencies
							addUniqueModule(dep, depPath);
							// only analyze the dependencies of UI5 projects recursively
							const depRoot = dependencyRoots?.find((root) => depPath.startsWith(root));
							// check if the dependency is a UI5 project (has a ui5.yaml or a .ui5pkg marker file)
							if (existsSync(path.join(depRoot, "ui5.yaml")) || existsSync(path.join(depRoot, ".ui5pkg"))) {
								const depContent = readFileSync(depPath, { encoding: "utf8" });
								// for UI5 projects we analyze the sap.ui.define|require|requireSync plus imports (due to TS)
								findUniqueJSDeps(depContent, depPath);
							}
						} else if (existsDep) {
							log.warn(`Skipping dependency "${dep}" as it is not part of the dependencies in package.json!`);
						}
					} catch (ex) {
						/* noop */
					}
				}
			}

			// utility to lookup unique JS dependencies
			// eslint-disable-next-line jsdoc/require-jsdoc
			function findUniqueJSDeps(content, parentDepPath, ignoreImports) {
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
								!ignoreImports &&
								/* ES6 dynamic import */
								node?.type === "ImportExpression"
							) {
								addDep(node.source.value);
							} else if (!ignoreImports && node?.type === "ImportDeclaration") {
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
			millis = Date.now();
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
					}),
				);
			}
			log.verbose(`XML scan took ${Date.now() - millis}ms`);

			// lookup all sources for their dependencies via the above utility
			millis = Date.now();
			await Promise.all(
				allSources.map(async (resource) => {
					log.verbose(`Processing source: ${resource.getPath()}`);

					const content = await resource.getString();
					findUniqueJSDeps(content, resource.getPath());

					return resource;
				}),
			);
			log.verbose(`JS scan took ${Date.now() - millis}ms`);

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
		 * @param {string} moduleName name of the module (e.g. "chart.js/auto")
		 * @param {object} options configuration options
		 * @param {string} options.cwd current working directory
		 * @param {string[]} options.depPaths paths of the dependencies (in addition for cwd)
		 * @returns {string} the path of the module in the filesystem
		 */
		// ignore module paths starting with a segment from the ignore list (TODO: maybe a better check?)
		resolveModule: function resolveModule(moduleName, { cwd = process.cwd(), depPaths = [] } = {}) {
			const cacheKey = createHash("md5")
				.update(`${[moduleName, cwd, ...depPaths].sort().join(",")}`)
				.digest("hex");
			if (modulesCache[cacheKey]) {
				return modulesCache[cacheKey];
			}
			// if a module is listed in the negative cache, we ignore it!
			if (modulesNegativeCache.indexOf(moduleName) !== -1 || /^\./.test(moduleName)) {
				return undefined;
			}
			// retrieve or create a resolved module
			//const millis = Date.now();
			log.verbose(`Resolving ${moduleName}...`);
			// package.json of app
			const pkg = require(path.join(cwd, "package.json"));
			// no module found => resolve it
			let modulePath;
			// resolve the module path
			if (moduleName?.startsWith(`${pkg.name}/`)) {
				// special handling for app-local resources!
				modulePath = path.join(cwd, moduleName.substring(`${pkg.name}/`.length));
				// check for the module path exists and to be a file
				modulePath = getModulePathWithExtension(modulePath);
			} else {
				// Implementation of the Node.js Package Entry Points mechanism
				// https://nodejs.org/api/packages.html#package-entry-points
				if (modulePath === undefined) {
					let pkgJsonFile,
						relativeModulePath,
						isEntryModule = true;

					// when resolving absolute files we lookup the package.json in the parent dirs
					// for later resolution of the module path (e.g. the mapping in browsers field)
					if (path.isAbsolute(moduleName)) {
						// lookup the parent dirs recursive to find package.json
						let dir = path.dirname(moduleName);
						while (dir !== path.dirname(dir)) {
							const pkgJson = path.join(dir, "package.json");
							if (existsSyncAndIsFile(pkgJson)) {
								pkgJsonFile = pkgJson;
								break;
							}
							dir = path.dirname(dir);
						}
						// the module path is the absolute path (but with file extension)
						modulePath = getModulePathWithExtension(moduleName);
						// if the absolute path is not a file we try to lookup the index module
						if (modulePath === undefined) {
							modulePath = getModulePathWithExtension(`${moduleName}/index`);
						}
					} else {
						// lookup the package.json with the npm package name
						const [, npmPackage, , , relModulePath] = npmPackageScopeRegEx.exec(moduleName) || [];
						pkgJsonFile = findDependency(`${npmPackage}/package.json`, cwd, depPaths);
						// short track if the module exists relative to the package.json
						// we can skip the resolution using the package.json fields to find the module
						if (pkgJsonFile && relModulePath) {
							const rootPath = path.dirname(pkgJsonFile);
							modulePath = getModulePathWithExtension(path.join(rootPath, relModulePath)); // undefined if it doesn't exist
							isEntryModule = false;
							relativeModulePath = relModulePath;
						}
					}

					// if a package.json file was found we try to resolve the module path
					// from the mappings in the package.json file (e.g. browser field)
					if (pkgJsonFile) {
						// determine the root path of the package.json file and load the package.json
						const rootPath = path.dirname(pkgJsonFile);
						const pkgJson = JSON.parse(readFileSync(pkgJsonFile, { encoding: "utf8" }));

						// entry modules must be resolved from the package.json fields
						if (isEntryModule && modulePath === undefined) {
							// exports first
							if (pkgJson.exports) {
								const exportsField = pkgJson.exports[relativeModulePath ? `./${relativeModulePath}` : "."];
								let main;
								if (typeof (main = exportsField?.browser?.default) === "string") {
									//console.log("##################", moduleName, "exports[.][browser][default]", main);
									modulePath = path.join(rootPath, main);
								} else if (typeof (main = exportsField?.import?.default) === "string") {
									//console.log("##################", moduleName, "exports[.][import][default]", main);
									modulePath = path.join(rootPath, main);
								} else if (typeof (main = exportsField?.import) === "string") {
									//console.log("##################", moduleName, "exports[.][import]", main);
									modulePath = path.join(rootPath, main);
								} else if (typeof (main = pkgJson.exports?.import) === "string") {
									//console.log("##################", moduleName, "exports[import]", main);
									modulePath = path.join(rootPath, main);
								} else if (typeof (main = exportsField?.require?.default) === "string") {
									//console.log("##################", moduleName, "exports[.][require][default]", main);
									modulePath = path.join(rootPath, main);
								} else if (typeof (main = exportsField?.require) === "string") {
									//console.log("##################", moduleName, "exports[.][require]", main);
									modulePath = path.join(rootPath, main);
								} else if (typeof (main = pkgJson.exports?.require) === "string") {
									//console.log("##################", moduleName, "exports[require]", main);
									modulePath = path.join(rootPath, main);
								} else if (typeof (main = exportsField?.default) === "string") {
									//console.log("##################", moduleName, "exports[.][default]", main);
									modulePath = path.join(rootPath, main);
								} else if (typeof (main = exportsField) === "string") {
									//console.log("##################", moduleName, "exports[.]", main);
									modulePath = path.join(rootPath, main);
								} else if (Array.isArray((main = pkgJson.exports["."]))) {
									//console.log("##################", moduleName, "exports[.][]", main.pop());
									const entry = main.pop();
									if (typeof entry?.import?.default === "string") {
										modulePath = path.join(rootPath, entry.import.default);
									} else if (typeof entry?.require?.default === "string") {
										modulePath = path.join(rootPath, entry.require.default);
									} else if (typeof entry?.default === "string") {
										modulePath = path.join(rootPath, entry.default);
									} else {
										//console.error("#### UNKNOWN CASE ####", "exports[.]", moduleName, JSON.stringify(entry));
									}
								} else {
									//console.error("#### UNKNOWN CASE ####", "exports", moduleName, JSON.stringify(pkgJson.exports));
								}
							} else if (typeof pkgJson.browser === "string") {
								//console.log("##################", moduleName, "browser", pkgJson.browser);
								modulePath = path.join(rootPath, pkgJson.browser);
							} else if (typeof pkgJson.module === "string") {
								//console.log("##################", moduleName, "module", pkgJson.module);
								modulePath = path.join(rootPath, pkgJson.module);
							} else if (typeof pkgJson.main === "string") {
								//console.log("##################", moduleName, "main", pkgJson.main);
								modulePath = path.join(rootPath, pkgJson.main);
							} else {
								// no configuration found, we lookup the index module
								modulePath = getModulePathWithExtension(path.join(rootPath, "index"));
							}
						}

						// if the package.json has a browser field we try to map the module path
						// (a false value in the browser field means the module should be ignored)
						if (typeof pkgJson.browser === "object") {
							//console.log("##################", moduleName, "browser", pkgJson.browser);
							const mappings = Object.fromEntries(
								Object.entries(pkgJson.browser)
									.filter(([key, value]) => {
										return value !== false; // these modules should ideally be ignored => maybe we make them undefined
									})
									.map(([key, value]) => {
										return [path.join(rootPath, key), path.join(rootPath, value)];
									}),
							);
							//console.log("##################", "before  ", modulePath);
							modulePath = mappings[modulePath] || modulePath;
							//console.log("##################", "after   ", modulePath);
						}

						// check for the module path exists and is a file
						// only then the module path is valid and can be returned
						if (modulePath !== undefined && !existsSyncAndIsFile(modulePath)) {
							modulePath = undefined;
						}
					}
				}

				// use the findDependency utility to resolve the module name
				if (modulePath === undefined) {
					//console.log("##################", "findDependency", moduleName);
					modulePath = findDependency(moduleName, cwd, depPaths);
				}
			}
			if (modulePath === undefined) {
				modulesNegativeCache.push(moduleName);
				log.verbose(`  => not found!`);
			} else if (modulePath === moduleName) {
				modulePath = undefined;
				modulesNegativeCache.push(moduleName);
				log.verbose(`  => found but ignored (identified as native node module)!`);
			} else {
				log.verbose(`  => found at ${modulePath}`);
			}
			if (modulePath) {
				modulesCache[cacheKey] = modulePath;
			}
			//console.log(`resolveModule "${moduleName}" took ${Date.now() - millis}ms`);
			return modulePath;
		},

		/**
		 * creates a bundle for the given module(s) using rollup
		 * @param {string|string[]} moduleNames name of the module (e.g. "chart.js/auto") or an array of module names
		 * @param {object} config configuration options
		 * @param {string} config.cwd current working directory
		 * @param {string[]} config.depPaths paths of the dependencies (in addition for cwd)
		 * @param {rollup.InputPluginOption[]} [config.beforePlugins] rollup plugins to be executed before
		 * @param {rollup.InputPluginOption[]} [config.afterPlugins] rollup plugins to be executed after
		 * @param {object} [config.pluginOptions] configuration options for the rollup plugins (e.g. webcomponents)
		 * @param {string} [config.generatedCode] ES compatibility of the generated code (es5, es2015)
		 * @param {object} [config.inject] the inject configuration for @rollup/plugin-inject
		 * @param {boolean} [config.isMiddleware] flag if the getResource is called by the middleware
		 * @returns {rollup.RollupOutput} the build output of rollup
		 */
		createBundle: async function createBundle(moduleNames, { cwd = process.cwd(), depPaths = [], beforePlugins, afterPlugins, pluginOptions, generatedCode, inject, isMiddleware } = {}) {
			const { walk } = await import("estree-walker");
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
							"global.process.versions.node": JSON.stringify("false"), // in some cases, the global.process.versions.node is used to detect the existence of Node.js
							"process.versions.node": JSON.stringify("18.15.0"), // needed for some modules to select features based on the Node.js version
							"process.env.NODE_ENV": JSON.stringify("production"), // we always build in production mode
							"child_process.exec": "function() {}", // avoid the usage of child_process.exec
						},
					}),

					injectESModule(),
					skipAssets({
						log,
						extensions: ["css"],
					}),
					json(),
					instructions(),
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
						moduleNames,
					}),
					// handle the webcomponents
					webcomponents({
						log,
						resolveModule: function (moduleName) {
							return that.resolveModule(moduleName, { cwd, depPaths });
						},
						framework: projectInfo?.framework,
						options: pluginOptions?.["webcomponents"],
					}),
					// once the node polyfills are injected, we can
					// resolve the modules from node_modules
					pnpmResolve({
						resolveModule: function (moduleName) {
							return that.resolveModule(moduleName, { cwd, depPaths });
						},
					}),
					// the following plugins must be executed after the
					// node polyfills are injected and the modules are resolved
					// to ensure that the modules are properly transformed
					nodePolyfills(),
					nodePolyfillsOverride.inject(inject),
					transformTopLevelThis({ log, walk }),
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
		 * @param {string|string[]} moduleNames name of the module (e.g. "chart.js/auto") or an array of module names
		 * @param {object} [config] configuration
		 * @param {object} [config.pluginOptions] configuration options for the rollup plugins (e.g. webcomponents)
		 * @param {boolean} [config.skipCache] skip the module cache
		 * @param {boolean} [config.persistentCache] flag whether the cache should be persistent
		 * @param {boolean} [config.debug] debug mode
		 * @param {boolean|string} [config.chunksPath] the relative path for the chunks to be stored (defaults to "chunks", if value is true, chunks are put into the closest modules folder)
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
		getBundleInfo: async function getBundleInfo(
			moduleNames,
			{ pluginOptions, skipCache, persistentCache, debug, chunksPath, skipTransform, keepDynamicImports, generatedCode, minify, inject } = {},
			{ cwd = process.cwd(), depPaths = [], isMiddleware } = {},
		) {
			let bundling = false;
			let bundleInfo = new BundleInfo();
			const bundleCacheOptions = {
				persist: persistentCache,
			};

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
						if (/\.(m|c)?js$/.test(path.extname(modulePath).toLowerCase()) && !shouldSkipTransform(moduleName) && !(await shouldSkipModule(modulePath))) {
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
				const myLastModified = new Date((await stat(__filename)).mtime).getTime();
				const cacheKey = createHash("md5")
					.update(`${myLastModified}:${lastModified}:${moduleNames.sort().join(",")}`)
					.digest("hex");

				// if modules have been found, we bundle them all in one
				const modules = bundleInfo.getModules();
				if (modules.length > 0) {
					// check whether the module should be built?
					if (skipCache || !BundleInfoCache.get(cacheKey, bundleCacheOptions)) {
						bundling = true;

						// bundle the given modules
						const options = {
							cwd,
							depPaths,
							beforePlugins: [logger({ log })],
							afterPlugins: [],
							generatedCode,
							minify,
							inject,
							isMiddleware,
							pluginOptions,
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
							/*
							// prefer the main field over the module field for module resolution
							const mainFirstMainFields = ["browser", "main", "module"];
							// update paths of modules for later matching
							modules.forEach((module) => {
								module.path = that.resolveModule(module.name, { cwd, depPaths, mainFields: mainFirstMainFields });
							});
							*/
							// related to issue #726 for which the generation of jspdf fails on Windows machines
							// when running the build in a standalone project with npm (without monorepo and pnpm)
							/* debug && */ //log.warn(`Failed to bundle "${nameOfModules}" using ES modules, falling back to CommonJS modules...`, ex.message);
							log.warn(`Failed to bundle "${nameOfModules}"...`, ex.message, ex);
							debug && log.verbose(ex); // report error in verbose case!
							/*
							output = await that.createBundle(
								nameOfModules,
								Object.assign({}, options, {
									mainFields: mainFirstMainFields,
								}),
							);
							*/
						}

						// parse the rollup build result
						output?.forEach((module, i) => {
							// lookup the output module in the list of input modules
							const resolvedModules = modules.filter((mod) => module?.facadeModuleId?.startsWith(mod.path));
							if (resolvedModules.length > 0) {
								// one module could be resolved by multiple input modules (e.g. export aliases in package.json)
								resolvedModules?.forEach((resolvedModule) => {
									// entry module
									resolvedModule.code = module.code;
								});
							} else {
								// chunk module
								if (module.code) {
									// find the module to which the chunk primarily belongs
									let filePath = chunksPath || "";
									if (chunksPath === true) {
										const referencedModuleIndex = output.findIndex((m) => m.isEntry && m.imports?.indexOf(module.fileName) !== -1);
										const referencedModule = modules[Math.max(referencedModuleIndex, 0)];
										filePath = referencedModule.name;
									} else if (typeof filePath === "string") {
										filePath = filePath
											.split(/[\\/]/)
											.map(sanitize)
											.filter((s) => !/^\.*$/.test(s))
											.join("/");
									} else {
										filePath = "";
									}
									const fileName = module.fileName.substring(0, module.fileName.length - 3);
									bundleInfo.addChunk({
										name: path.posix.join(filePath, fileName),
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
								let moduleBasePath;
								let { namespace: projectNamespace, type: projectType } = projectInfo || {};
								if (projectType === "application" && projectNamespace) {
									// for applications we need to adjust the module base path so that the
									// modules are resolved relative to the project namespace (to support CDN cases)
									moduleBasePath = path.posix.join(projectNamespace, "resources");
								} else {
									// HINT: UI5 module loader first resolves the paths of modules and then match
									//       it against the central modules =>
									//       in CDN cases, root resources are resolved against the CDN
									moduleBasePath = path.posix.relative(`/${path.dirname(moduleName)}`, "/");
								}
								bundleInfo.getChunks().forEach((chunk) => {
									const originalChunkName = chunk.originalName;
									const chunkName = chunk.name;
									module.code = module.code?.replace(`'./${originalChunkName}'`, `'${moduleBasePath || "."}/${chunkName}'`);
									module.code = module.code?.replace(`"./${originalChunkName}"`, `"${moduleBasePath || "."}/${chunkName}"`);
								});
							});
							return bundleInfo;
						};

						// cache the output
						BundleInfoCache.store(cacheKey, fixImports(bundleInfo), bundleCacheOptions);
					} else {
						// retrieve the cached output
						bundleInfo = BundleInfoCache.get(cacheKey, bundleCacheOptions);
					}
				}
			} catch (err) {
				if (bundling) {
					console.error(`Couldn't bundle ${moduleNames}!\n${err.message}\n${err.frame}`, err);
					//log.error(`Couldn't bundle ${moduleNames}!\n${err.message}\n${err.frame}`);
				}
				bundleInfo.error = err;
			}
			return bundleInfo;
		},

		/**
		 * Lookup and returns a resource from the node_modules.
		 * @param {string} resourceName the resource name
		 * @param {object} [options] additional options
		 * @param {string} [options.cwd] current working directory
		 * @param {string[]} [options.depPaths] paths of the dependencies (in addition for cwd)
		 * @param {boolean} [options.isMiddleware] flag if the getResource is called by the middleware
		 * @returns {undefined|string} the content of the resource or undefined if not found
		 */
		getResource: function getResource(resourceName, { cwd = process.cwd(), depPaths = [], isMiddleware }) {
			const resourcePath = that.resolveModule(`${resourceName}`, { cwd, depPaths });
			if (typeof resourcePath === "string" && existsSync(resourcePath)) {
				let code = readFileSync(resourcePath, {
					encoding: "utf8",
				});
				return {
					name: resourceName,
					path: resourcePath,
					code,
				};
			} else if (!isMiddleware) {
				log.error(`Resource ${resourceName} not found. Ignoring resource...`);
			}
		},

		/**
		 * Check the existence of a resource in the node_modules
		 * @param {string} resourceName the resource name
		 * @param {object} [options] additional options
		 * @param {string} [options.cwd] current working directory
		 * @param {string[]} [options.depPaths] paths of the dependencies (in addition for cwd)
		 * @param {boolean} [options.onlyFiles] true, if only files should be checked
		 * @returns {boolean} true, if the resource exists (as a folder or file)
		 */
		existsResource: function existsResource(resourceName, { cwd = process.cwd(), depPaths = [], onlyFiles }) {
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
		 * @param {string} npmPackageName name of the module (e.g. "chart.js/auto")
		 * @param {object} [options] additional options
		 * @param {string} [options.cwd] current working directory
		 * @param {string[]} [options.depPaths] paths of the dependencies (in addition for cwd)
		 * @param {string[]} [options.ignore] list of globs to be ignored
		 * @returns {string[]} a list of resource paths
		 */
		listResources: function listResources(npmPackageName, { cwd = process.cwd(), depPaths = [], ignore }) {
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

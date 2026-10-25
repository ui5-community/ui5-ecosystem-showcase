const os = require("os");
const path = require("path");
const fs = require("fs");

const { minimatch } = require("minimatch");

// https://babeljs.io/docs/
const babel = require("@babel/core");

// https://browsersl.ist/
// https://github.com/browserslist/browserslist#queries
const browserslist = require("browserslist");

// JSON parser with comments (for tsconfig.json or babel config)
const JSONC = require("comment-json");

// eslint-disable-next-line jsdoc/require-jsdoc
function multiply(fileName, exts) {
	return exts.map((ext) => {
		return `${fileName}${ext}`;
	});
}

// utility to resolve the node modules (also for mono repo environments)
// eslint-disable-next-line jsdoc/require-jsdoc
function resolveNodeModule(moduleName, cwd = process.cwd()) {
	let modulePath;
	// resolve from node_modules via regular lookup
	try {
		// try the lookup relative to CWD
		modulePath = require.resolve(moduleName, {
			paths: [cwd] // necessary for PNPM and/or DEBUG scenario
		});
		// eslint-disable-next-line no-unused-vars
	} catch (err) {
		// use the default lookup
		try {
			modulePath = require.resolve(moduleName);
			// eslint-disable-next-line no-unused-vars
		} catch (err) {
			// gracefully ignore the error
			//console.error(err);
		}
	}
	return modulePath;
}

// https://babeljs.io/docs/en/config-files

// project-wide configuration
// https://babeljs.io/docs/config-files#project-wide-configuration
const PRJ_CFG_FILES = [...multiply("babel.config", [".json", ".js", ".cjs", ".mjs"])];

// file-relative configuration
// https://babeljs.io/docs/config-files#file-relative-configuration
// => Babel stops recursive lookup of configuration files at the project root (package.json)
const CFG_FILES = [...multiply(".babelrc", [".json", ".js", ".cjs", ".mjs"]), ".babelrc", "package.json"];

// helper to load the babel configuration
// eslint-disable-next-line jsdoc/require-jsdoc
async function loadBabelConfigOptions(babelConfigOptions, skipBabelPresetPluginResolve, cwd = process.cwd()) {
	// load the babel configuration file if specified
	if (typeof babelConfigOptions === "string") {
		babelConfigOptions = { configFile: babelConfigOptions };
	}
	// make the paths of the babel plugins and presets absolute
	let fileToPresetOrPlugin;
	if (!skipBabelPresetPluginResolve) {
		const normalizationInfo = normalizeBabelConfigOptions(babelConfigOptions, cwd);
		babelConfigOptions = normalizationInfo?.babelConfigOptions;
		fileToPresetOrPlugin = normalizationInfo?.fileToPresetOrPlugin;
	}
	// let babel load the babel config
	const partialConfig = await babel.loadPartialConfigAsync(
		Object.assign(
			{
				cwd,
				configFile: false,
				babelrc: false,
				filename: "src/dummy.js", // necessary for ignore/include/exclude
				envName: process.env.BABEL_ENV || process.env.NODE_ENV || "development"
			},
			babelConfigOptions
		)
	);
	const loadedBabelConfigOptions = partialConfig?.options;
	// correct the request property again
	if (!skipBabelPresetPluginResolve) {
		postprocessBabelConfigOptions(loadedBabelConfigOptions, fileToPresetOrPlugin);
	}
	// ready
	return loadedBabelConfigOptions;
}

// helper to find the babel configuration
// eslint-disable-next-line jsdoc/require-jsdoc
async function findBabelConfigOptions(cwd) {
	let configFile;

	const findConfigFile = function (cfgFiles, dir) {
		const configFile = cfgFiles.find((cfgFile) => {
			return fs.existsSync(path.join(dir, cfgFile));
		});
		return configFile && path.join(dir, configFile);
	};

	configFile = findConfigFile(PRJ_CFG_FILES, cwd);
	while (!configFile) {
		configFile = findConfigFile(CFG_FILES, cwd);
		if (cwd == path.dirname(cwd)) {
			break;
		}
		cwd = path.dirname(cwd);
	}

	let babelConfigOptions;
	if (path.basename(configFile) === "package.json") {
		// for the package.json, we need to extract the babel config
		const pkgJson = JSON.parse(fs.readFileSync(configFile, { encoding: "utf8" }));
		if (pkgJson.babel) {
			babelConfigOptions = pkgJson.babel;
		} else {
			babelConfigOptions = configFile = undefined;
		}
	} else if (configFile) {
		// for a babel config file we load it on our own to normalize the plugin/preset paths
		// => no recursive merging of babel config is possible with this approach
		try {
			babelConfigOptions = JSONC.parse(fs.readFileSync(configFile, { encoding: "utf8" }));
			// eslint-disable-next-line no-unused-vars
		} catch (err) {
			// no JSON so we let Babel lookup the configuration file with the Babel API
			const partialConfig = await babel.loadPartialConfigAsync({
				configFile,
				cwd
			});
			// but we only extract the presets and plugins and ignore the other properties
			babelConfigOptions = partialConfig?.options;
		}
	}

	return babelConfigOptions ? { configFile, babelConfigOptions } : undefined;
}

// utility to normalize the name of the babel preset or plugin
// like specified here: https://babeljs.io/docs/options#name-normalization
// eslint-disable-next-line jsdoc/require-jsdoc
function normalizePresetOrPlugin(babelPresetOrPlugin, isPreset) {
	const type = isPreset ? "preset" : "plugin";
	let moduleName = babelPresetOrPlugin;
	let matches;
	if (!moduleName) {
		// empty module names stay untouched
	} else if (path.isAbsolute(moduleName)) {
		// absolute paths stay untouched
	} else if (moduleName.startsWith("./")) {
		// relative paths stay untouched
	} else if ((matches = /^module:(.*)/.exec(moduleName))) {
		// any identifier prefixed with module: will have the prefix removed but otherwise be untouched.
		moduleName = matches[1];
	} else if ((matches = new RegExp(`^@babel/(?!${type}-)([^/]+)$`).exec(moduleName))) {
		// plugin-/preset- will be injected at the start of any @babel-scoped package that doesn't have it as a prefix.
		moduleName = `@babel/${type}-${matches[1]}`;
		/* eslint-disable-next-line no-useless-assignment */
	} else if ((matches = /^@([^/]+)$/.exec(moduleName))) {
		// babel-plugin/babel-preset will be injected as the package name if only the @-scope name is given.
		moduleName = `${moduleName}/babel-${type}`;
		/* eslint-disable-next-line no-useless-assignment */
	} else if ((matches = new RegExp(`^(?!(@|babel-${type}-))([^/]+)$`).exec(moduleName))) {
		// babel-plugin-/babel-preset- will be injected as a prefix any unscoped package that doesn't have it as a prefix
		moduleName = `babel-${type}-${moduleName}`;
	} else if ((matches = new RegExp(`^(@(?!babel)(?:[^/]+)/)([^/]+)$`).exec(moduleName))) {
		// babel-plugin-/babel-preset- will be injected as a prefix any @-scoped package that doesn't have it anywhere in their name.
		if (!new RegExp(`babel-${type}`).test(matches[2])) {
			moduleName = `${matches[1]}babel-${type}-${matches[2]}`;
		}
	}
	return moduleName;
}

// utility to normalize and resolve the babel preset or plugin
// eslint-disable-next-line jsdoc/require-jsdoc
function resolvePresetOrPlugin(babelPresetOrPlugin, isPreset, fileToPresetOrPlugin = {}, cwd = process.cwd()) {
	// either an array or string is processed here as ConfigItems
	// should be ignored and just returned (already resolved by babel)
	// => in case of the preset/plugin cannot be resolved, we return just
	//    use the given preset/plugin name and let babel do the resolve
	//    which may lead to issues in pnpm or global UI5 CLI scenarios (rare cases!)
	// => in addition we add a hint to the fileTotPresetOrPlugin map so that later
	//    the original name of the preset/plugin can be derived again
	//    for the ConfigItem property: plugin|preset.file.request
	if (Array.isArray(babelPresetOrPlugin)) {
		const request = babelPresetOrPlugin[0];
		const normalized = normalizePresetOrPlugin(babelPresetOrPlugin[0], isPreset);
		babelPresetOrPlugin[0] = resolveNodeModule(normalized, cwd) || babelPresetOrPlugin[0];
		fileToPresetOrPlugin[babelPresetOrPlugin[0]] = request;
	} else if (typeof babelPresetOrPlugin === "string") {
		const request = babelPresetOrPlugin;
		const normalized = normalizePresetOrPlugin(babelPresetOrPlugin, isPreset);
		babelPresetOrPlugin = resolveNodeModule(normalized, cwd) || babelPresetOrPlugin;
		fileToPresetOrPlugin[babelPresetOrPlugin] = request;
	}
	return babelPresetOrPlugin;
}

// helper to normalize and resolve the babel configuration (resolve plugins and presets to absolute paths)
// eslint-disable-next-line jsdoc/require-jsdoc
function normalizeBabelConfigOptions(babelConfigOptions, cwd = process.cwd()) {
	const fileToPresetOrPlugin = {};
	// resolve the presets
	if (Array.isArray(babelConfigOptions?.presets)) {
		babelConfigOptions.presets = babelConfigOptions.presets.map((preset) =>
			resolvePresetOrPlugin(preset, true, fileToPresetOrPlugin, cwd)
		);
	}
	// resolve the plugins
	if (Array.isArray(babelConfigOptions?.plugins)) {
		babelConfigOptions.plugins = babelConfigOptions.plugins.map((plugin) =>
			resolvePresetOrPlugin(plugin, false, fileToPresetOrPlugin, cwd)
		);
	}
	return { babelConfigOptions, fileToPresetOrPlugin };
}

// helper to postprocess the babel configuration and restore the "request" property for the plugins/presets
// eslint-disable-next-line jsdoc/require-jsdoc
function postprocessBabelConfigOptions(loadedBabelConfigOptions, fileToPresetOrPlugin = {}) {
	const fixFileRequest = function (loadedPresetsOrPlugins) {
		if (Array.isArray(loadedPresetsOrPlugins)) {
			loadedPresetsOrPlugins.forEach((presetOrPlugin) => {
				const request = presetOrPlugin.file.request;
				presetOrPlugin.file.request = fileToPresetOrPlugin[request] || request;
			});
		}
	};
	// fix the presets
	fixFileRequest(loadedBabelConfigOptions?.presets);
	// fix the plugins
	fixFileRequest(loadedBabelConfigOptions?.plugins);
}

/**
 * Derive a `modulesMap` function from TypeScript/JavaScript path aliases and the project's
 * source folder / namespace mapping.
 *
 * Only wildcard entries (key ending with `/*`, first target ending with `/*` or bare `*`) are
 * processed. Exact-match entries are silently skipped.
 *
 * @param {object} configuration normalized configuration (from createConfiguration)
 * @param {object} [sourceFolders] map of source folder → dotted namespace (e.g. `{ webapp: "myapp" }`)
 * @param {Function} [debugLog] optional debug logger (called with a string message)
 * @returns {Function|undefined} modulesMap function, or undefined if no mappable aliases found
 */
function deriveModulesMap(configuration, sourceFolders, debugLog) {
	const rawAliases = configuration.pathAliases;
	if (!rawAliases || typeof rawAliases !== "object") {
		return undefined;
	}

	// resolve the source folder and its namespace from sourceFolders
	// we expect exactly one entry for applications (e.g. { webapp: "myapp" })
	// for libraries we use the first (non-test) entry
	const sourceFolderEntries = Object.entries(sourceFolders || {});
	const [sourceFolder, namespaceDotted] = sourceFolderEntries[0] || [];
	const namespacePrefix = namespaceDotted ? namespaceDotted.replace(/\./g, "/") : undefined;

	const rules = [];
	for (const [aliasKey, aliasTargets] of Object.entries(rawAliases)) {
		// only handle wildcard entries: key must end with /*
		if (!aliasKey.endsWith("/*")) {
			debugLog?.(`autoMapPathAliases: skipping non-wildcard alias key "${aliasKey}"`);
			continue;
		}
		const firstTarget = Array.isArray(aliasTargets) ? aliasTargets[0] : aliasTargets;
		if (typeof firstTarget !== "string" || !firstTarget.endsWith("/*")) {
			debugLog?.(`autoMapPathAliases: skipping alias "${aliasKey}" — target is not a wildcard string`);
			continue;
		}

		const aliasPrefix = aliasKey.slice(0, -1); // strip trailing *  e.g. "@/"
		// strip trailing /* and leading ./ from target  e.g. "./webapp/*" → "webapp"
		const targetDir = firstTarget.slice(0, -2).replace(/^\.\//, "");

		let ui5Prefix;
		if (!targetDir || targetDir === sourceFolder) {
			// target is the source root itself
			ui5Prefix = namespacePrefix ? `${namespacePrefix}/` : "";
		} else if (sourceFolder && targetDir.startsWith(`${sourceFolder}/`)) {
			// target is a sub-path inside the source folder
			const sub = targetDir.slice(sourceFolder.length + 1);
			ui5Prefix = namespacePrefix ? `${namespacePrefix}/${sub}/` : `${sub}/`;
		} else if (!sourceFolder) {
			// no sourceFolders info — use target dir as-is
			ui5Prefix = `${targetDir}/`;
		} else {
			debugLog?.(
				`autoMapPathAliases: skipping alias "${aliasKey}" — target "${targetDir}" is outside source folder "${sourceFolder}"`
			);
			continue;
		}

		rules.push({ aliasPrefix, ui5Prefix });
	}

	if (rules.length === 0) {
		return undefined;
	}

	debugLog?.(
		`autoMapPathAliases: derived ${rules.length} mapping rule(s) from ui5.yaml pathAliases:\n` +
			rules.map(({ aliasPrefix, ui5Prefix }) => `  "${aliasPrefix}*" → "${ui5Prefix}*"`).join("\n")
	);

	return function modulesMap(src) {
		for (const { aliasPrefix, ui5Prefix } of rules) {
			if (src.startsWith(aliasPrefix)) {
				return ui5Prefix + src.slice(aliasPrefix.length);
			}
		}
		return src;
	};
}

module.exports = function (log) {
	const _this = {
		/**
		 * Helper to resolve node modules
		 *
		 * @param {string} moduleName the name of the node module to lookup
		 * @param {string} [cwd] the cwd to lookup the configuration (defaults to process.cwd())
		 * @returns {string} the absolute path of the node module
		 */
		resolveNodeModule,
		/**
		 * Derive the `sourceFolders` map for `babel-plugin-transform-modules-ui5` from the UI5
		 * tooling project object and the project's dotted namespace.
		 *
		 * Returns an object like `{ src: "my.lib", test: "my.lib.test" }` for libraries or
		 * `{ webapp: "my.app" }` for applications.  The source folder name is always read from
		 * the project's configured source path so that non-default paths (set via
		 * `resources.configuration.paths.*` in `ui5.yaml`) are handled correctly.
		 *
		 * Returns `undefined` when the project type is unknown or no namespace is available.
		 *
		 * @param {object} project UI5 tooling project interface (from taskUtil/middlewareUtil.getProject())
		 * @param {string} [cwd] project root directory (defaults to process.cwd())
		 * @returns {object|undefined} sourceFolders map or undefined
		 */
		deriveSourceFolders: function deriveSourceFolders(project, cwd = process.cwd()) {
			const projectType = project.getType?.();
			const rawNamespace = project.getNamespace?.();
			if (!projectType || !rawNamespace) return undefined;
			const projectNamespace = rawNamespace.replace(/\//g, ".");

			// Resolve the actual source folder name from the project's configured source path.
			// getSourcePath() returns the absolute FS path; we make it relative to cwd
			// to get the folder name as the plugin will see it (e.g. "src", "webapp").
			const sourcePath = project.getSourcePath?.();
			const srcFolder = sourcePath ? path.relative(cwd, sourcePath) : undefined;

			if (projectType === "application") {
				if (!srcFolder) return undefined;
				return { [srcFolder]: projectNamespace };
			}

			if (projectType === "library") {
				if (!srcFolder) return undefined;
				// The test folder name is not exposed publicly, so derive it from the
				// custom configuration (resources.configuration.paths.test) when set,
				// falling back to the conventional "test" name.
				const customPaths = project.getCustomConfiguration?.()?.resources?.configuration?.paths;
				const testFolder = customPaths?.test ?? "test";
				return {
					[srcFolder]: projectNamespace,
					[testFolder]: `${projectNamespace}.test`
				};
			}

			return undefined;
		},
		/**
		 * Build the configuration for the task and the middleware.
		 *
		 * @param {object} cfg configuration object
		 * @param {object} cfg.configuration task/middleware configuration
		 * @param {boolean} cfg.isMiddleware true, if the function is called from the middleware
		 * @param {string} [cwd] the cwd to lookup the configuration (defaults to process.cwd())
		 * @returns {object} the translated task/middleware configuration
		 */
		createConfiguration: function createConfiguration({ configuration, isMiddleware }, cwd = process.cwd()) {
			// extract the configuration
			const config = configuration || {};
			let tsConfig = "tsconfig.json";

			// check the altTsConfig file to exist in the project
			if (config.altTsConfig) {
				if (!fs.existsSync(path.join(cwd, config.altTsConfig))) {
					throw new Error(
						`The specified altTsConfig file does not exist: ${config.altTsConfig} (cwd: ${cwd})`
					);
				} else {
					tsConfig = config.altTsConfig;
					config.debug && log.verbose(`Using tsconfig.json from: ${tsConfig} (cwd: ${cwd})`);
				}
			}

			// if a tsconfig.json file exists, the project is a TypeScript project
			const tsConfigFile = path.join(cwd, tsConfig);
			const isTypeScriptProject = fs.existsSync(tsConfigFile);

			// parse tsconfig.json once for transpileDependencies detection
			let parsedTsConfig;
			if (isTypeScriptProject) {
				parsedTsConfig = JSONC.parse(fs.readFileSync(tsConfigFile, { encoding: "utf8" }));
			}

			// read tsconfig.json to determine whether to transpile dependencies or not
			if (isTypeScriptProject && !config.transpileDependencies) {
				const tsDeps = parsedTsConfig?.compilerOptions?.types?.filter((typePkgName) => {
					try {
						// if a type dependency includes a ui5.yaml we assume
						// to support transpiling of dependencies - and in case
						// of the project is built already the js files are
						// available and can be served directly without transpile
						const ui5YamlPath = require.resolve(`${typePkgName}/ui5.yaml`, {
							paths: [cwd]
						});
						return !!ui5YamlPath;
						// eslint-disable-next-line no-unused-vars
					} catch (err) {
						return false;
					}
				});
				config.transpileDependencies = (tsDeps?.length || 0) > 0;
			}

			// derive whether TypeScript should be transformed or not
			const transformTypeScript = config.transformTypeScript ?? config.transpileTypeScript ?? isTypeScriptProject;

			// load the pkgJson to determine the existence of the @ui5/ts-interface-generator
			// to automatically set the config option generateTsInterfaces (if this is a ts project)
			// in case of running the code inside a middleware
			let generateTsInterfaces = config.generateTsInterfaces;
			const pkgJsonPath = path.join(cwd, "package.json");
			if (
				isMiddleware &&
				transformTypeScript &&
				generateTsInterfaces === undefined &&
				fs.existsSync(pkgJsonPath)
			) {
				const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, { encoding: "utf8" }));
				const deps = [
					...Object.keys(pkgJson?.dependencies || {}),
					...Object.keys(pkgJson?.devDependencies || {})
				];
				if (deps.indexOf("@ui5/ts-interface-generator") !== -1) {
					generateTsInterfaces = true;
				}
			}

			// derive whether the includes/excludes should be matched via glob (minimatch)
			// instead of the classic substring matching (opt-in to stay backward compatible)
			const useGlobPatterns = config.useGlobPatterns ?? false;

			// derive the includes/excludes from the configuration
			const includes = config.includes || config.includePatterns || [];
			// the built-in default excludes must be expressed as globs when glob matching is enabled
			const defaultExcludes = useGlobPatterns ? ["**/*.png", "**/*.jpeg", "**/*.jpg"] : [".png", ".jpeg", ".jpg"];
			const excludes = defaultExcludes.concat(config.excludes || config.excludePatterns || []);

			// derive whether JSX/TSX should be transformed or not
			const transformJSX = config.transformJSX;

			// determine the file pattern from config or based on TypeScript project
			let filePattern = config.filePattern; // .+(ts|tsx)
			if (filePattern === undefined) {
				if (transformJSX) {
					filePattern = transformTypeScript ? ".+(ts|tsx)" : ".+(js|jsx)";
				} else {
					filePattern = transformTypeScript ? ".ts" : ".js";
				}
			}

			// derive transformation parameters
			const transformModulesToUI5 = config.transformModulesToUI5 ?? !!transformTypeScript;
			const transformAsyncToPromise = config.transformAsyncToPromise ?? config.transpileAsync;

			// return the normalized configuration object
			const normalizedConfiguration = {
				debug: config.debug,
				babelConfig: config.babelConfig,
				generateBabelConfig: config.generateBabelConfig,
				sourceFolders: config.sourceFolders,
				includes,
				excludes,
				useGlobPatterns,
				filePattern,
				omitTSFromBuildResult: config.omitTSFromBuildResult,
				omitSourceMaps: config.omitSourceMaps,
				generateTsInterfaces,
				generateTsInterfacesJsDoc: config.generateTsInterfacesJsDoc,
				generateDts: config.generateDts,
				failOnDtsErrors: config.failOnDtsErrors,
				transpileDependencies: config.transpileDependencies,
				transformAtStartup: config.transformAtStartup,
				transformTypeScript,
				tsConfigFile,
				pathAliases: config.pathAliases,
				transformModulesToUI5,
				transformAsyncToPromise,
				transformJSX,
				coverage: config.coverage,
				targetBrowsers: config.targetBrowsers,
				removeConsoleStatements: config.removeConsoleStatements,
				skipBabelPresetPluginResolve: config.skipBabelPresetPluginResolve,
				injectSourceFolders: config.injectSourceFolders
			};
			config.debug &&
				log.verbose(`Normalized configuration:\n${JSON.stringify(normalizedConfiguration, null, 2)}`);
			return normalizedConfiguration;
		},

		/**
		 * Inject auto-derived options (sourceFolders, dependencies) into the transform-ui5
		 * preset entry of an externally-supplied babel config object (from a .babelrc file or
		 * an inline babelConfig in ui5.yaml).  Only fills keys that the user has not already
		 * set explicitly, so user-supplied values always win.
		 *
		 * @param {object} babelConfigOptions babel configuration object to patch (mutated in place)
		 * @param {object} autoOpts options to inject, e.g. `{ sourceFolders, dependencies }`
		 */
		injectUI5PresetOptions: function injectUI5PresetOptions(babelConfigOptions, autoOpts) {
			if (!babelConfigOptions?.presets?.length || !Object.keys(autoOpts).length) return;
			const presets = babelConfigOptions.presets;
			for (let i = 0; i < presets.length; i++) {
				const entry = presets[i];
				const name = Array.isArray(entry) ? entry[0] : entry;
				if (typeof name === "string" && /transform.*ui5/i.test(name)) {
					if (Array.isArray(entry)) {
						// ["transform-ui5", { ...userOpts }] — merge, user opts win
						entry[1] = Object.assign({}, autoOpts, entry[1] || {});
					} else {
						// "transform-ui5" — promote to array form with auto opts
						presets[i] = [entry, Object.assign({}, autoOpts)];
					}
					break;
				}
			}
		},

		/**
		 * Lookup the Babel configuration from ui5.yaml, Babel configuration files in file system,
		 * generated Babel configuration from configuration options or fallback to default
		 * configuration.
		 *
		 * @param {object} cfg configuration object
		 * @param {object} cfg.configuration task/middleware configuration
		 * @param {boolean} cfg.isMiddleware true, if the function is called from the middleware
		 * @param {Function} [cfg.preprocess] function to preprocess the babel configuration (before loaded)
		 * @param {Function} [cfg.postprocess] function to postprocess the babel configuration (after loaded)
		 * @param {string} [cwd] the cwd to lookup the configuration (defaults to process.cwd())
		 * @returns {object} the babel plugins configuration
		 */
		createBabelConfig: async function createBabelConfig(
			{ configuration, isMiddleware, preprocess, postprocess, sourceFolders, dependencies },
			cwd = process.cwd()
		) {
			// Things to consider:
			//   - middleware uses configs from app also for dependencies
			//   - task must provide the cwd from outside

			// report usage of configuration options in case ofan external
			//  configuration file or inline Babel config is used
			const warnAboutIgnoredConfig = function () {
				[
					"transpileAsync",
					"transformModulesToUI5",
					"transformAsyncToPromise",
					"removeConsoleStatements",
					"transformJSX",
					"coverage"
				].forEach((config) => {
					if (configuration?.[config] !== undefined) {
						log.warn(`Ignoring configuration option "${config}" due to external configuration!`);
					}
				});
			};

			// utility to update the babel config
			const updateBabelConfigOptions = async function (babelConfigOptions) {
				// in the middleware case we generate the sourcemaps inline for
				// debugging purposes since the middleware may not know about the
				// sourcemaps files next to the source file
				if (isMiddleware) {
					babelConfigOptions.sourceMaps = "inline";
				}
				// call the preprocess hook
				if (typeof preprocess === "function") {
					preprocess(babelConfigOptions);
				}
				// finally load the babel config
				const loadedBabelConfigOptions = await loadBabelConfigOptions(
					babelConfigOptions,
					configuration.skipBabelPresetPluginResolve,
					cwd
				);
				// call the postprocess hook
				if (typeof postprocess === "function") {
					postprocess(babelConfigOptions);
				}
				// some logging
				configuration?.debug && log.verbose(`${JSON.stringify(loadedBabelConfigOptions, null, 2)}`);
				return loadedBabelConfigOptions;
			};

			// the inline babel configuration in the ui5.yaml wins
			let babelConfigOptions = configuration?.babelConfig;
			if (babelConfigOptions) {
				if (configuration?.debug) {
					log.info(`Using inline Babel configuration from ui5.yaml...`);
					warnAboutIgnoredConfig();
				}
				if (configuration?.injectSourceFolders) {
					const autoOpts = {};
					if (sourceFolders) autoOpts.sourceFolders = sourceFolders;
					if (dependencies?.length) autoOpts.dependencies = dependencies;
					_this.injectUI5PresetOptions(babelConfigOptions, autoOpts);
				}
				return await updateBabelConfigOptions(babelConfigOptions);
			}

			// lookup the babel config by file
			const config = await findBabelConfigOptions(cwd);
			if (config) {
				if (configuration?.debug) {
					log.info(`Using Babel configuration from ${config.configFile}...`);
					warnAboutIgnoredConfig();
				}
				if (configuration?.injectSourceFolders) {
					const autoOpts = {};
					if (sourceFolders) autoOpts.sourceFolders = sourceFolders;
					if (dependencies?.length) autoOpts.dependencies = dependencies;
					_this.injectUI5PresetOptions(config.babelConfigOptions, autoOpts);
				}
				return await updateBabelConfigOptions(config.babelConfigOptions);
			}

			// create configuration based on ui5.yaml configuration options
			configuration?.debug && log.info(`Create Babel configuration based on ui5.yaml configuration options...`);
			if (configuration?.debug) {
				sourceFolders && log.info(`sourceFolders: ${JSON.stringify(sourceFolders)}`);
				dependencies?.length &&
					log.info(
						`dependencies (${dependencies.length}):\n${dependencies.map((d) => `  ${d.sourceRoot} ${JSON.stringify(d.sourceFolders)}`).join("\n")}`
					);
			}

			// create the babel configuration based on the ui5.yaml
			babelConfigOptions = { plugins: [], presets: [] };

			// order of the presets is important: last preset is applied first
			// which means the .babelrc config should look like that:
			//
			//  "presets": [
			//      "@babel/preset-env",        // applied 3rd
			//      "transform-ui5",            // applied 2nd
			//      "@babel/preset-typescript"  // applied 1st
			//  ],
			//
			// so, first transpile typescript, then ES modules/classes to UI5
			// and finally transpile the rest to the target browser env.

			// add the env preset and configure to support the
			// last 2 browser versions (can be overruled via
			// configuration option defined in the ui5.yaml
			// using https://github.com/browserslist/browserslist)
			let browserListConfigFile;
			try {
				browserListConfigFile = browserslist.findConfig(cwd);
				// eslint-disable-next-line no-unused-vars
			} catch (err) {
				configuration?.debug && log.info(`Unable to find browserslist configuration. Fallback to default...`);
			}
			const envPreset = ["@babel/preset-env"];
			if (browserListConfigFile) {
				configuration?.debug && log.info(`Using external browserslist configuration...`);
			} else {
				configuration?.debug && log.info(`Using browserslist configuration from ui5.yaml...`);
				if (process.env?.["ui5_tooling_transpile__target_rhino"]) {
					// necessary to transpile to ES5 for Rhino (to support some legacy Java tools)
					envPreset.push({
						targets: {
							rhino: process.env?.["ui5_tooling_transpile__target_rhino"]
						}
					});
				} else {
					envPreset.push({
						targets: {
							// future: consider to read the browserslist config from OpenUI5/SAPUI5?
							// env variables must not use "-" or "." and therefore we use "_" only
							browsers:
								process.env?.["ui5_tooling_transpile__target_browsers"] ||
								process.env?.["ui5_tooling_transpile__targetBrowsers"] ||
								configuration?.targetBrowsers ||
								"defaults"
						}
					});
				}
			}
			// disable the modules conversion as this is handled by the transform-ui5 preset
			if (envPreset.length === 1) {
				envPreset.push({});
			}
			envPreset[1].modules = false;
			// add the env preset to the presets
			babelConfigOptions.presets.push(envPreset);

			// add the presets to enable transformation of ES modules to
			// UI5 modules and ES classes to UI5 classes
			if (configuration?.transformModulesToUI5) {
				const userOpts =
					typeof configuration.transformModulesToUI5 === "object" ? configuration.transformModulesToUI5 : {};
				// sourceFolders maps each source folder to its dotted namespace prefix so the
				// plugin resolves the per-file namespace from the folder map directly.
				// Injection priority (last-wins via Object.assign):
				//   1. auto-derived base: sourceFolders from project type
				//   2. explicit user opts from ui5.yaml (transformModulesToUI5: { ... }) always win
				const autoOpts = sourceFolders ? { sourceFolders } : {};
				if (dependencies?.length) autoOpts.dependencies = dependencies;
				// derive modulesMap from explicit pathAliases in ui5.yaml,
				// unless the user has already set modulesMap explicitly
				if (!userOpts.modulesMap) {
					const modulesMap = deriveModulesMap(
						configuration,
						sourceFolders,
						configuration?.debug ? (msg) => log.info(msg) : undefined
					);
					if (modulesMap) {
						autoOpts.modulesMap = modulesMap;
					}
				} else if (configuration?.debug) {
					log.info(`pathAliases: skipping modulesMap derivation — modulesMap is already set explicitly`);
				}
				const presetOpts = Object.assign(autoOpts, userOpts);
				if (Object.keys(presetOpts).length > 0) {
					babelConfigOptions.presets.push(["transform-ui5", presetOpts]);
				} else {
					babelConfigOptions.presets.push("transform-ui5");
				}
			}

			// add the preset to enable the transpiling of TS to JS
			if (configuration?.transformTypeScript) {
				// if the configuration option transformTypeScript is an object
				// it contains the configuration options for the plugin
				if (typeof configuration.transformTypeScript === "object") {
					babelConfigOptions.presets.push(["@babel/preset-typescript", configuration.transformTypeScript]);
				} else {
					babelConfigOptions.presets.push("@babel/preset-typescript");
				}
			}

			// add the plugin to transform JSX/TSX to JavaScript
			// the plugin is only added when the configuration option
			// transformJSX is present/truthy and the optional dependency
			// "@babel/plugin-transform-react-jsx" can be resolved
			if (configuration?.transformJSX) {
				if (resolveNodeModule("@babel/plugin-transform-react-jsx", cwd)) {
					// if the configuration option transformJSX is an object
					// it contains the configuration options for the plugin
					// (e.g. { runtime: "automatic", importSource: "..." })
					if (typeof configuration.transformJSX === "object") {
						babelConfigOptions.plugins.push([
							"@babel/plugin-transform-react-jsx",
							configuration.transformJSX
						]);
					} else {
						babelConfigOptions.plugins.push("@babel/plugin-transform-react-jsx");
					}
				} else {
					log.warn(
						`Missing dependency "@babel/plugin-transform-react-jsx"! JSX/TSX will not be transformed until dependency has been added...`
					);
				}
			}

			// add plugin to remove console statements
			if (configuration?.removeConsoleStatements) {
				babelConfigOptions.plugins.push("transform-remove-console");
			}

			// add plugin to transform async statements to promises
			// by default Babel uses the regenerator runtime but this
			// requires bigger redundant inline code and it is also
			// not CSP compliant => therefore the Promise is the better
			// solution than using the regenerator runtime
			if (configuration?.transformAsyncToPromise) {
				babelConfigOptions.plugins.push([
					"transform-async-to-promises",
					{
						inlineHelpers: true
					}
				]);
			}

			// add plugin to instrument the code for coverage collection
			// the plugin is only added when the configuration option
			// coverage is present/truthy and the optional dependency
			// "babel-plugin-istanbul" can be resolved - it is added last
			// so that it wraps the already transformed source
			if (configuration?.coverage) {
				if (resolveNodeModule("babel-plugin-istanbul", cwd)) {
					// if the configuration option coverage is an object
					// it contains the configuration options for the plugin
					if (typeof configuration.coverage === "object") {
						babelConfigOptions.plugins.push(["babel-plugin-istanbul", configuration.coverage]);
					} else {
						babelConfigOptions.plugins.push("babel-plugin-istanbul");
					}
				} else {
					log.warn(
						`Missing dependency "babel-plugin-istanbul"! Code will not be instrumented until dependency has been added...`
					);
				}
			}

			// include the source maps
			babelConfigOptions.sourceMaps = configuration?.omitSourceMaps ? false : true;

			// create the babel config file in the current working directory if missing
			if (configuration?.generateBabelConfig) {
				const babelConfigFile = path.join(
					cwd,
					typeof configuration?.generateBabelConfig === "string"
						? configuration?.generateBabelConfig
						: "babel.config.json"
				);
				if (!fs.existsSync(babelConfigFile)) {
					fs.mkdirSync(path.dirname(babelConfigFile), { recursive: true });
					fs.writeFileSync(babelConfigFile, JSON.stringify(babelConfigOptions, null, 2), {
						encoding: "utf8"
					});
				}
			}

			return updateBabelConfigOptions(babelConfigOptions);
		},

		/**
		 * Normalizes the line feeds of the code to OS default
		 *
		 * @param {string} code the code
		 * @returns {string} the normalized code
		 */
		normalizeLineFeeds: function normalizeLineFeeds(code) {
			// since Babel does not care about linefeeds, see here:
			// https://github.com/babel/babel/issues/8921#issuecomment-492429934
			// we have to search for any EOL character and replace it
			// with correct EOL for this OS
			return code.replace(/\r\n|\r|\n/g, os.EOL);
		},

		/**
		 * Checks whether the given path name should be handled
		 *
		 * @param {string} pathname the path name
		 * @param {Array<string>} excludes exclude paths
		 * @param {Array<string>} includes include paths
		 * @param {boolean} [useGlob] match patterns via glob (minimatch) instead of substring
		 * @returns {boolean} true, if the path should be handled
		 */
		shouldHandlePath: function shouldHandlePath(pathname, excludes = [], includes = [], useGlob = false) {
			// when glob matching is enabled, patterns are matched via minimatch; otherwise the
			// classic substring matching is used (default, backward compatible)
			const matches = (patterns) =>
				(patterns || []).some((pattern) =>
					useGlob ? minimatch(pathname, pattern) : pathname.includes(pattern)
				);
			return !matches(excludes) || matches(includes);
		},

		/**
		 * Determine the given resources' file system path
		 *
		 * @param {module:@ui5/fs.Resource} resource the resource
		 * @param {string} [cwd] the cwd to lookup the configuration (defaults to process.cwd())
		 * @returns {string} the file system path
		 */
		determineResourceFSPath: function determineResourceFSPath(resource, cwd = process.cwd()) {
			let resourcePath = resource.getPath();
			// Prefer the real FS path from source metadata whenever it is available.
			// This covers both root-project resources and workspace-dependency resources
			// (e.g. a library symlinked via npm workspaces): all FileSystem-adapter-backed
			// resources have fsPath populated. Falling back to the virtual UI5 path
			// (e.g. /resources/com/myorg/mylib/Example.ts) would prevent the
			// babel-plugin-transform-modules-ui5 dependencies option from matching the file
			// against any dep.sourceRoot, so the namespace would never be derived.
			// The cwd parameter is kept for API compatibility but is no longer used here.
			void cwd;
			resourcePath = resource.getSourceMetadata()?.fsPath || resourcePath;
			return resourcePath;
		},

		/**
		 * Transforms code synchronously using Babel
		 *
		 * @param {string} code code to transform
		 * @param {object} opts options
		 * @returns {string} transformed code
		 */
		transform: function transform(code, opts) {
			return babel.transform(code, opts);
		},

		/**
		 * Transforms code asynchronously using Babel
		 *
		 * @param {string} code code to transform
		 * @param {object} opts options
		 * @returns {string} transformed code
		 */
		transformAsync: async function transformAsync(code, opts) {
			return babel.transformAsync(code, opts);
		}
	};
	// expose internal functions for testing purposes
	_this._helpers = {
		loadBabelConfigOptions,
		findBabelConfigOptions,
		normalizeBabelConfigOptions,
		postprocessBabelConfigOptions,
		resolvePresetOrPlugin,
		normalizePresetOrPlugin,
		deriveModulesMap
	};
	return _this;
};

const os = require("os");
const path = require("path");
const fs = require("fs");

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

// https://babeljs.io/docs/en/config-files

// project-wide configuration
const PRJ_CFG_FILES = [...multiply("babel.config", [".json", ".js", ".cjs", ".mjs"])];

// file-relative configuration
const CFG_FILES = [...multiply(".babelrc", [".json", ".js", ".cjs", ".mjs"]), ".babelrc", "package.json"];

// helper to load the babel configuration
// eslint-disable-next-line jsdoc/require-jsdoc
async function loadBabelConfigOptions(babelConfigOptions, skipBabelPresetPluginResolve, cwd = process.cwd()) {
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
			let exists = fs.existsSync(path.join(dir, cfgFile));
			// for the package.json we need to check if the babel property exists
			if (exists && cfgFile === "package.json") {
				const pkgJson = JSON.parse(fs.readFileSync(path.join(dir, cfgFile), { encoding: "utf8" }));
				exists = pkgJson.babel !== undefined;
			}
			return exists;
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
	if (configFile && path.basename(configFile) === "package.json") {
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
	} else if ((matches = /^@([^/]+)$/.exec(moduleName))) {
		// babel-plugin/babel-preset will be injected as the package name if only the @-scope name is given.
		moduleName = `${moduleName}/babel-${type}`;
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
	//    which may lead to issues in pnpm or global ui5 tooling scenarios (rare cases!)
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

			// if a tsconfig.json file exists, the project is a TypeScript project
			const tscJsonPath = path.join(cwd, "tsconfig.json");
			const isTypeScriptProject = fs.existsSync(tscJsonPath);

			// read tsconfig.json to determine whether to transpile dependencies or not
			if (isTypeScriptProject && !config.transpileDependencies && fs.existsSync(tscJsonPath)) {
				const tscJson = JSONC.parse(fs.readFileSync(tscJsonPath, { encoding: "utf8" }));
				const tsDeps = tscJson?.compilerOptions?.types?.filter((typePkgName) => {
					try {
						// if a type dependency includes a ui5.yaml we assume
						// to support transpiling of dependencies - and in case
						// of the project is built already the js files are
						// available and can be served directly without transpile
						const ui5YamlPath = require.resolve(`${typePkgName}/ui5.yaml`, {
							paths: [cwd]
						});
						return !!ui5YamlPath;
					} catch (e) {
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

			// derive the includes/excludes from the configuration
			const includes = config.includes || config.includePatterns || [];
			const defaultExcludes = [".png", ".jpeg", ".jpg"]; // still needed?
			const excludes = defaultExcludes.concat(config.excludes || config.excludePatterns || []);

			// determine the file pattern from config or based on TypeScript project
			let filePattern = config.filePattern; // .+(ts|tsx)
			if (filePattern === undefined) {
				filePattern = transformTypeScript ? ".ts" : ".js";
			}

			// derive transformation parameters
			const transformModulesToUI5 = config.transformModulesToUI5 ?? !!transformTypeScript;
			const transformAsyncToPromise = config.transformAsyncToPromise ?? config.transpileAsync;

			// return the normalized configuration object
			const normalizedConfiguration = {
				debug: config.debug,
				babelConfig: config.babelConfig,
				includes,
				excludes,
				filePattern,
				omitTSFromBuildResult: config.omitTSFromBuildResult,
				generateTsInterfaces,
				generateDts: config.generateDts,
				transpileDependencies: config.transpileDependencies,
				transformAtStartup: config.transformAtStartup,
				transformTypeScript,
				transformModulesToUI5,
				transformAsyncToPromise,
				targetBrowsers: config.targetBrowsers,
				removeConsoleStatements: config.removeConsoleStatements,
				skipBabelPresetPluginResolve: config.skipBabelPresetPluginResolve
			};
			config.debug &&
				log.verbose(`Normalized configuration:\n${JSON.stringify(normalizedConfiguration, null, 2)}`);
			return normalizedConfiguration;
		},

		/**
		 * Lookup the Babel configuration from ui5.yaml, Babel configuration files in file system,
		 * generated Babel configuration from configuration options or fallback to default
		 * configuration.
		 *
		 * @param {object} cfg configuration object
		 * @param {object} cfg.configuration task/middleware configuration
		 * @param {boolean} cfg.isMiddleware true, if the function is called from the middleware
		 * @param {function} [cfg.preprocess] function to preprocess the babel configuration (before loaded)
		 * @param {function} [cfg.postprocess] function to postprocess the babel configuration (after loaded)
		 * @param {string} [cwd] the cwd to lookup the configuration (defaults to process.cwd())
		 * @returns {object} the babel plugins configuration
		 */
		createBabelConfig: async function createBabelConfig(
			{ configuration, isMiddleware, preprocess, postprocess },
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
					"removeConsoleStatements"
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
				return await updateBabelConfigOptions(babelConfigOptions);
			}

			// lookup the babel config by file
			const config = await findBabelConfigOptions(cwd);
			if (config) {
				if (configuration?.debug) {
					log.info(`Using Babel configuration from ${config.configFile}...`);
					warnAboutIgnoredConfig();
				}
				return await updateBabelConfigOptions(config.babelConfigOptions);
			}

			// create configuration based on ui5.yaml configuration options
			configuration?.debug && log.info(`Create Babel configuration based on ui5.yaml configuration options...`);

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
			} catch (ex) {
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
			babelConfigOptions.presets.push(envPreset);

			// add the presets to enable transformation of ES modules to
			// UI5 modules and ES classes to UI5 classes
			if (configuration?.transformModulesToUI5) {
				// if the configuration option transformModulesToUI5 is an object
				// it contains the configuration options for the plugin
				if (typeof configuration.transformModulesToUI5 === "object") {
					babelConfigOptions.presets.push(["transform-ui5", configuration.transformModulesToUI5]);
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

			// include the source maps
			babelConfigOptions.sourceMaps = true;

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
		 * @returns {boolean} true, if the path should be handled
		 */
		shouldHandlePath: function shouldHandlePath(pathname, excludes = [], includes = []) {
			return (
				!(excludes || []).some((pattern) => pathname.includes(pattern)) ||
				(includes || []).some((pattern) => pathname.includes(pattern))
			);
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
			// specVersion 3.0 provides source metadata and only if the
			// current work directory is the rootpath of the project resource
			// it is a root resource which should be considered to be resolved
			if (path.relative(cwd, resource.getProject().getRootPath()) === "") {
				// npm dependencies don't have sourceMetadata applied to resource!
				resourcePath = resource.getSourceMetadata()?.fsPath || resourcePath;
			}
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
		normalizePresetOrPlugin
	};
	return _this;
};

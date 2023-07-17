const log = require("@ui5/logger").getLogger("builder:customtask:ui5-tooling-transpile");

const os = require("os");
const path = require("path");
const fs = require("fs");

// https://babeljs.io/docs/
const babel = require("@babel/core");

// https://browsersl.ist/
// https://github.com/browserslist/browserslist#queries
const browserslist = require("browserslist");

// eslint-disable-next-line jsdoc/require-jsdoc
function multiply(fileName, exts) {
	return exts.map((ext) => {
		return `${fileName}${ext}`;
	});
}

// https://babeljs.io/docs/en/config-files

// project-wide configuration
const PRJ_CFG_FILES = [...multiply("babel.config", [".json", ".js", ".cjs", ".mjs"])];

// file-relative configuration
const CFG_FILES = [...multiply(".babelrc", [".json", ".js", ".cjs", ".mjs"]), ".babelrc", "package.json"];

// eslint-disable-next-line jsdoc/require-jsdoc
async function findBabelConfig(dir) {
	let configFile;

	const findConfigFile = function (cfgFiles, dir) {
		const configFile = cfgFiles.find((cfgFile) => {
			return fs.existsSync(path.join(dir, cfgFile));
		});
		return configFile && path.join(dir, configFile);
	};

	configFile = findConfigFile(PRJ_CFG_FILES, dir);
	while (!configFile) {
		configFile = findConfigFile(CFG_FILES, dir);
		if (dir == path.dirname(dir)) {
			break;
		}
		dir = path.dirname(dir);
	}

	let partialConfig;
	if (path.basename(configFile) === "package.json") {
		// for the package.json, we need to extract the babel config
		partialConfig = require(configFile);
		if (partialConfig.babel) {
			partialConfig = await babel.loadPartialConfigAsync(
				Object.assign({ filename: "src/dummy.js" }, partialConfig.babel)
			);
		} else {
			partialConfig = configFile = undefined;
		}
	} else if (configFile) {
		// the `filename` field is required
		// in case there're filename-related options like `ignore` in the user config
		partialConfig = await babel.loadPartialConfigAsync({ configFile, filename: "src/dummy.js" });
	}

	return partialConfig ? { configFile, options: partialConfig.options } : undefined;
}

const _this = (module.exports = {
	/**
	 * Build the configuration for the task and the middleware.
	 *
	 * @param {object} configuration task/middleware configuration
	 * @param {string} [cwd] the cwd to lookup the configuration (defaults to process.cwd())
	 * @returns {object} the translated task/middleware configuration
	 */
	createConfiguration: function createConfiguration(configuration, cwd = process.cwd()) {
		// extract the configuration
		const config = configuration || {};

		// if a tsconfig.json file exists, the project is a TypeScript project
		const isTypeScriptProject = fs.existsSync(path.join(cwd, "tsconfig.json"));

		// derive whether TypeScript should be transformed or not
		const transformTypeScript = config.transformTypeScript ?? config.transpileTypeScript ?? isTypeScriptProject;

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
			generateDts: config.generateDts,
			transpileDependencies: config.transpileDependencies,
			transformAtStartup: config.transformAtStartup,
			transformTypeScript,
			transformModulesToUI5,
			transformAsyncToPromise,
			targetBrowsers: config.targetBrowsers,
			removeConsoleStatements: config.removeConsoleStatements
		};
		config.debug && log.verbose(`Normalized configuration:\n${JSON.stringify(normalizedConfiguration, null, 2)}`);
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
	 * @param {string} [cwd] the cwd to lookup the configuration (defaults to process.cwd())
	 * @returns {object} the babel plugins configuration
	 */
	createBabelConfig: async function createBabelConfig({ configuration, isMiddleware }, cwd = process.cwd()) {
		// Things to consider:
		//   - middleware uses configs from app also for dependencies
		//   - task must provide the cwd from outside

		// report usage of configuration options in case ofan external
		//  configuration file or inline Babel config is used
		const warnAboutIgnoredConfig = function () {
			["transpileAsync", "transformModulesToUI5", "transformAsyncToPromise", "removeConsoleStatements"].forEach(
				(config) => {
					if (configuration?.[config] !== undefined) {
						log.warn(`Ignoring configuration option "${config}" due to external configuration!`);
					}
				}
			);
		};

		// utility to add source maps support for middleware usage
		const enhanceForSourceMaps = function (babelConfig) {
			if (isMiddleware) {
				babelConfig.sourceMaps = "inline";
			}
			return babelConfig;
		};

		// the inline babel configuration in the ui5.yaml wins
		let babelConfig = configuration?.babelConfig;
		if (babelConfig) {
			if (configuration?.debug) {
				log.info(`Using inline Babel configuration from ui5.yaml...`);
				warnAboutIgnoredConfig();
				log.verbose(`${JSON.stringify(babelConfig, null, 2)}`);
			}
			return enhanceForSourceMaps(babelConfig);
		}

		// lookup the babel config by file
		const config = await findBabelConfig(cwd);
		if (config) {
			if (configuration?.debug) {
				log.info(`Using Babel configuration from ${config.configFile}...`);
				warnAboutIgnoredConfig();
				log.verbose(`${JSON.stringify(config.options, null, 2)}`);
			}
			return enhanceForSourceMaps(config.options);
		}

		// create configuration based on ui5.yaml configuration options
		configuration?.debug && log.info(`Create Babel configuration based on ui5.yaml configuration options...`);

		// create the babel configuration based on the ui5.yaml
		babelConfig = { ignore: ["**/*.d.ts"], plugins: [], presets: [] };

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
			envPreset.push({
				targets: {
					// future: consider to read the browserslist config from OpenUI5/SAPUI5?
					// env variables must not use "-" or "." and therefore we use "_" only
					browsers:
						process.env?.["ui5_tooling_transpile__targetBrowsers"] ||
						configuration?.targetBrowsers ||
						"defaults"
				}
			});
		}
		babelConfig.presets.push(envPreset);

		// add the presets to enable transformation of ES modules to
		// UI5 modules and ES classes to UI5 classes
		if (configuration?.transformModulesToUI5) {
			// if the configuration option transformModulesToUI5 is an object
			// it contains the configuration options for the plugin
			if (typeof configuration.transformModulesToUI5 === "object") {
				babelConfig.presets.push(["transform-ui5", configuration.transformModulesToUI5]);
			} else {
				babelConfig.presets.push("transform-ui5");
			}
		}

		// add the preset to enable the transpiling of TS to JS
		if (configuration?.transformTypeScript) {
			// if the configuration option transformTypeScript is an object
			// it contains the configuration options for the plugin
			if (typeof configuration.transformTypeScript === "object") {
				babelConfig.presets.push(["@babel/preset-typescript", configuration.transformTypeScript]);
			} else {
				babelConfig.presets.push("@babel/preset-typescript");
			}
		}

		// add plugin to remove console statements
		if (configuration?.removeConsoleStatements) {
			babelConfig.plugins.push("transform-remove-console");
		}

		// add plugin to transform async statements to promises
		// by default Babel uses the regenerator runtime but this
		// requires bigger redundant inline code and it is also
		// not CSP compliant => therefore the Promise is the better
		// solution than using the regenerator runtime (by default)
		if (configuration?.transformAsyncToPromise) {
			babelConfig.plugins.push([
				"transform-async-to-promises",
				{
					inlineHelpers: true
				}
			]);
		} else if (configuration?.targetBrowsers === undefined) {
			log.warn(
				"Babel uses regenerator runtime to transpile async/await for older target browsers. As this is not CSP compliant consider the usage of transformAsyncToPromise to convert async/await to Promises!"
			);
		}

		// in the middleware case we generate the sourcemaps inline for
		// debugging purposes since the middleware may not know about the
		// sourcemaps files next to the source file
		if (isMiddleware) {
			babelConfig.sourceMaps = "inline";
		} else {
			babelConfig.sourceMaps = true;
		}

		configuration?.debug && log.verbose(`${JSON.stringify(babelConfig, null, 2)}`);

		return babelConfig;
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
	 * @returns true, if the path should be handled
	 */
	shouldHandlePath: function shouldHandlePath(pathname, excludes = [], includes = []) {
		return (
			!(excludes || []).some((pattern) => pathname.includes(pattern)) ||
			(includes || []).some((pattern) => pathname.includes(pattern))
		);
	},

	/**
	 * Determines the applications base path from the given resource collection.
	 *
	 * <b>ATTENTION: this is a hack to be compatible with UI5 tooling 2.x and 3.x</b>
	 *
	 * @param {module:@ui5/fs.AbstractReader} collection Reader or Collection to read resources of the root project and its dependencies
	 * @returns {string} application base path
	 */
	determineProjectBasePath: function (collection) {
		let projectBasePath;
		if (collection?._readers) {
			for (const _reader of collection._readers) {
				projectBasePath = _this.determineProjectBasePath(_reader);
				if (projectBasePath) break;
			}
		}
		if (/^(application|library)$/.test(collection?._project?._type)) {
			projectBasePath = collection._project._modulePath; // UI5 tooling 3.x
		} else if (/^(application|library)$/.test(collection?._project?.type)) {
			projectBasePath = collection._project.path; // UI5 tooling 2.x
		} else if (typeof collection?._fsBasePath === "string") {
			projectBasePath = collection._fsBasePath;
		}
		return projectBasePath;
	},

	/**
	 * Determine the given resources' file system path
	 *
	 * <b>ATTENTION: this is a hack to be compatible with UI5 tooling 2.x and 3.x</b>
	 *
	 * @param {module:@ui5/fs.Resource} resource the resource
	 * @param {string} [cwd] the cwd to lookup the configuration (defaults to process.cwd())
	 * @returns {string} the file system path
	 */
	determineResourceFSPath: function determineResourceFSPath(resource, cwd = process.cwd()) {
		let resourcePath = resource.getPath();
		if (typeof resource.getSourceMetadata === "function") {
			// specVersion 3.0 provides source metadata and only if the
			// current work directory is the rootpath of the project resource
			// it is a root resource which should be considered to be resolved
			if (path.relative(cwd, resource.getProject().getRootPath()) === "") {
				resourcePath = resource.getSourceMetadata().fsPath || resourcePath;
			}
		} else {
			// for older versions resolving the file system path is a bit more
			// tricky and also here we only consider the root resources rather
			// than the dependencies...
			const isRootResource = resource?._project?._isRoot;
			if (isRootResource) {
				const rootPath = resource._project.path;
				const pathMappings = resource._project.resources?.pathMappings;
				const pathMapping = Object.keys(pathMappings).find((basePath) => resourcePath.startsWith(basePath));
				resourcePath = path.join(
					rootPath,
					pathMappings[pathMapping],
					resourcePath.substring(pathMapping.length)
				);
			}
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
});

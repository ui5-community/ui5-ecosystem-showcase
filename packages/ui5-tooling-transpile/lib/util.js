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

module.exports = {
	/**
	 * Lookup the Babel configuration from ui5.yaml, Babel configuration files in file system,
	 * generated Babel configuration from configuration options or fallback to default
	 * configuration.
	 *
	 * @param {object} cfg configuration object
	 * @param {object} cfg.configuration task/middleware configuration
	 * @param {boolean} cfg.isMiddleware true, if the function is called from the middleware
	 * @returns {object} the babel plugins configuration
	 */
	createBabelConfig: async function createBabelConfig({ configuration, isMiddleware }) {
		// Things to consider:
		//   - middleware uses configs from app also for dependencies
		//   - task uses .babelrc and .browserslistrc from app but config
		//     in ui5.yaml from the different projects (since the config
		//     files are loaded relative to process.cwd())

		// for testing purposes we store the cwd of the initial function call
		const cwd = process.cwd();

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

		// add the presets to enable transformation of ES modules to
		// UI5 modules and ES classes to UI5 classes
		const transformModulesToUI5 =
			configuration?.transformModulesToUI5 !== undefined
				? configuration?.transformModulesToUI5
				: configuration?.transpileTypeScript;
		if (transformModulesToUI5) {
			babelConfig.presets.push("transform-ui5");
		}

		// add the preset to enable the transpiling of TS to JS
		if (configuration?.transpileTypeScript) {
			babelConfig.presets.push("@babel/preset-typescript");
		}

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
					browsers: configuration?.targetBrowsers || "defaults"
				}
			});
		}
		babelConfig.presets.push(envPreset);

		// add plugin to remove console statements
		if (configuration?.removeConsoleStatements) {
			babelConfig.plugins.push("transform-remove-console");
		}

		// add plugin to transform async statements to promises
		// by default Babel uses the regenerator runtime but this
		// requires bigger redundant inline code and it is also
		// not CSP compliant => therefore the Promise is the better
		// solution than using the regenerator runtime (by default)
		const transformAsyncToPromise =
			configuration?.transformAsyncToPromise !== undefined
				? configuration?.transformAsyncToPromise
				: configuration?.transpileAsync;
		if (transformAsyncToPromise) {
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
	}
};

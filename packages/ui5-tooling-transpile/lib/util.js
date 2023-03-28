const log = require("@ui5/logger").getLogger("builder:customtask:ui5-tooling-transpile");

const os = require("os");
const path = require("path");
const fs = require("fs");
const babel = require("@babel/core");

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
async function findBabelConfig(dir = ".") {
	let configFile;
	dir = path.resolve(process.cwd(), dir);

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
			configuration?.debug && log.info(`Using inline Babel configuration from ui5.yaml...`);
			return enhanceForSourceMaps(babelConfig);
		}

		// lookup the babel config by file
		let config = await findBabelConfig();
		if (config) {
			configuration?.debug && log.info(`Using Babel configuration from ${config.configFile}...`);
			return enhanceForSourceMaps(config.options);
		}

		// create configuration based on ui5.yaml configuration options
		configuration?.debug && log.info(`Create Babel configuration based on ui5.yaml configuration options...`);

		// create the babel configuration based on the ui5.yaml
		babelConfig = { plugins: [], presets: [], sourceMaps: true };

		// include additional plugins as configured in the ui5.yaml
		if (configuration.removeConsoleStatements) {
			babelConfig.plugins.push("transform-remove-console");
		}
		if (configuration.transpileAsync) {
			babelConfig.plugins.push([
				"babel-plugin-transform-async-to-promises",
				{
					inlineHelpers: true
				}
			]);
		}
		if (configuration.transpileTypeScript) {
			// the TypeScript babel configuration
			babelConfig.presets.push("transform-ui5", "@babel/preset-typescript");
		} else {
			// the default babel configuration
			babelConfig.presets.push([
				"@babel/preset-env",
				{
					targets: {
						browsers: "last 2 versions, ie 10-11"
					}
				}
			]);
		}

		// in the middleware case we generate the sourcemaps inline for
		// debugging purposes since the middleware may not know about the
		// sourcemaps files next to the source file
		if (isMiddleware) {
			babelConfig.sourceMaps = "inline";
		} else {
			babelConfig.sourceMaps = true;
		}

		return babelConfig;
	},

	/**
	 * Normalizes the line feeds of the code to OS default
	 *
	 * @param {string} code the code
	 * @returns the normalized code
	 */
	normalizeLineFeeds: function normalizeLineFeeds(code) {
		// since Babel does not care about linefeeds, see here:
		// https://github.com/babel/babel/issues/8921#issuecomment-492429934
		// we have to search for any EOL character and replace it
		// with correct EOL for this OS
		return code.replace(/\r\n|\r|\n/g, os.EOL);
	}
};

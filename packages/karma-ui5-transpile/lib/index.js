"use strict";

const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

const { createConfiguration, createBabelConfig, transform } = require("ui5-tooling-transpile/lib/util");

/**
 * This Karma preprocessor is used to transpile code respecting the
 * configuration of the ui5-tooling-transpile tooling extension for
 * the UI5 Tooling.
 *
 * Kudos goes to: https://github.com/babel/karma-babel-preprocessor
 * which inspired the creation of this Karma preprocessor.
 *
 * @param {object} config Config object of UI5.
 * @param {object} logger Karma's logger.
 * @returns {Function} The preprocess function.
 */
function createPreprocessor(config, logger) {
	const log = logger.create("preprocessor.ui5-transpile");

	// determine the ui5.yaml path from base path + alternative config path
	const basePath = config.basePath;
	const configPath = config.ui5?.configPath || "ui5.yaml";
	const ui5YamlPath = path.join(basePath, configPath);

	// read the ui5.yaml file
	let configs;
	try {
		const content = fs.readFileSync(ui5YamlPath, "utf-8");
		configs = yaml.loadAll(content);
	} catch (err) {
		if (err.name === "YAMLException") {
			log.error(`Failed to read ${configPath}!`);
		}
		throw err;
	}

	// determine the ui5-tooling-transpile-task configuration
	const customTasks = configs?.[0]?.builder?.customTasks;
	const transpileTask = customTasks?.find((customTask) => customTask.name === "ui5-tooling-transpile-task");
	const configuration = createConfiguration(transpileTask?.configuration);

	// create the Babel configuration using the ui5-tooling-tranpile-task util
	const babelConfigCreated = createBabelConfig({ configuration, isMiddleware: false }).then((babelOptions) => {
		// and inject the babel-plugin-istanbul into the configuration
		babelOptions.plugins = babelOptions.plugins || [];
		//babelOptions.plugins.push("istanbul");
		return babelOptions;
	});

	/**
	 * preprocess function for the individual files to transpile
	 *
	 * @param {string} content file content
	 * @param {object} file file info
	 * @param {Function} done callback function when done
	 */
	async function preprocess(content, file, done) {
		log.debug('Processing "%s".', file.originalPath);
		try {
			const babelConfig = await babelConfigCreated;
			const processed = transform(
				content,
				Object.assign({}, babelConfig, {
					filename: file.originalPath,
					sourceMaps: true // we need to create source maps to attach it later
				})
			);
			let code = content;
			if (processed) {
				code = processed.code;
			}
			// replace all suffixes with ".js" (e.g. .jsx to .js, or .ts to .js or .tsx to .js)
			file.path = file.originalPath.replace(/\.[^.]+$/, ".js");
			file.sourceMap = processed.map; // attach the source map to the file
			done(code);
		} catch (e) {
			log.error("%s\n at %s", e.message, file.originalPath);
			done(e);
		}
	}
	return preprocess;
}
createPreprocessor.$inject = ["config", "logger"];

// export the preprocessor configuration
module.exports = {
	"preprocessor:ui5-transpile": ["factory", createPreprocessor]
};

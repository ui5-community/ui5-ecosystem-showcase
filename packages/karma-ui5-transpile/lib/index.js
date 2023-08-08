const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

/**
 * This Karma preprocessor is used to transpile code respecting the
 * configuration of the ui5-tooling-transpile tooling extension for
 * the UI5 Tooling.
 *
 * Kudos goes to: https://github.com/babel/karma-babel-preprocessor
 * which inspired the creation of this Karma preprocessor.
 * @param {object} config Config object of UI5.
 * @param {object} logger Karma's logger.
 * @returns {Function} The preprocess function.
 */
function createPreprocessor(config, logger) {
	const log = logger.create("preprocessor.ui5-transpile");
	// create a UI5 logger compatible API for the Karma logger
	["silly", "verbose", "perf", "info", "warn", "error", "silent"].forEach((level) => {
		if (!log[level]) {
			log[level] = log.debug;
		}
	});
	const { createConfiguration, createBabelConfig, transform } = require("ui5-tooling-transpile/lib/util")(log);

	// when using karma-ui5-transpile, karma-coverage preprocessor must not be used
	// => follow-up instrumentation with karma-coverage leads to wrong results as the
	//    istanbul instrumenter is running after the complete transpile and when adding
	//    istanbul as a Babel plugin it is executed directly after the TypeScript
	//    transpilation which is the right point in time!
	if (typeof config?.preprocessors === "object") {
		Object.values(config?.preprocessors).forEach((preprocessorList) => {
			if (
				Array.isArray(preprocessorList) &&
				preprocessorList.indexOf("ui5-transpile") !== -1 &&
				preprocessorList.indexOf("coverage") !== -1
			) {
				log.warn(
					`The preprocessors "ui5-transpile" and "coverage" should not be used together. The preprocessor "ui5-transpile" includes the "babel-plugin-istanbul" into the Babel transformation configuration! Please remove the "coverage" preprocessor, the "coverage" reporter can be kept!`
				);
			}
		});
	}

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
		// if not already configured in the plugins section
		babelOptions.plugins = babelOptions.plugins || [];
		if (
			!babelOptions.plugins.find((plugin) => {
				return plugin.file.request === "istanbul";
			})
		) {
			const istanbulConfig = {
				include: ["**/*"],
				exclude: []
			};
			// apply the `instrumenterOptions` for istanbul from `coverageReporter` in the `karma.config`
			const instrumenterOptionsIstanbul = config.coverageReporter?.instrumenterOptions?.istanbul;
			if (instrumenterOptionsIstanbul && typeof instrumenterOptionsIstanbul === "object") {
				Object.assign(istanbulConfig, config.coverageReporter.instrumenterOptions.istanbul);
			}
			// add istanbul as first plugin into the plugins chain
			babelOptions.plugins.unshift(["istanbul", istanbulConfig]);
		}
		return babelOptions;
	});

	/**
	 * preprocess function for the individual files to transpile
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
					sourceMaps: "inline" // inline source maps for code completion / code coverage results on source file
				})
			);
			let code = content;
			if (processed) {
				code = processed.code;
				file.sourceMap = processed.map; // attach the source map to the file
			}
			// replace all suffixes with ".js" (e.g. .jsx to .js, or .ts to .js or .tsx to .js)
			file.path = file.originalPath.replace(/\.[^.]+$/, ".js");
			file.originalPath = file.path;
			done(null, code);
		} catch (e) {
			log.error("%s\n at %s\n%s", e.message, file.originalPath, e.stack);
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

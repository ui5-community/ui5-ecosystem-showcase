const path = require("path");
const { existsSync } = require("fs");
const WebComponentRegistry = require("./utils/WebComponentRegistry");

/**
 * Custom task to create the UI5 AMD-like bundles for used ES imports from node_modules.
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/logger/Logger} parameters.log Logger instance
 * @param {module:@ui5/fs/DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {object} parameters.taskUtil Specification Version dependent interface to a
 *                [TaskUtil]{@link module:@ui5/builder.tasks.TaskUtil} instance
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.projectNamespace] Project namespace if available
 * @param {object} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
module.exports = async function ({ log, workspace, taskUtil /*, options */ }) {
	// determine the current working directory and the package.json path
	let cwd = taskUtil.getProject().getRootPath() || process.cwd();
	let pkgJsonPath = path.join(cwd, "package.json");

	// if the package.json is not in the root of the project, try to find it
	// in the npm_package_json environment variable (used by npm scripts)
	if (!existsSync(pkgJsonPath)) {
		pkgJsonPath = process.env.npm_package_json;
		cwd = path.dirname(pkgJsonPath);
	}
	const pkgJson = require(pkgJsonPath);

	for (const dep of Object.keys(pkgJson.dependencies)) {
		console.log("XXX", WebComponentRegistry.getPackage(dep));
	}

	const apiJsons = await workspace.byGlob("/**/designtime/api.json");
	if (apiJsons.length === 1) {
		const apiJson = JSON.parse(await apiJsons[0].getString());
		console.log("API JSON");
		apiJson.__MODIFIED = "HURRAY";
		apiJsons[0].setString(JSON.stringify(apiJson, null, 2));
		await workspace.write(apiJsons[0]);
	}

	log.info("Hello World!");
};

/**
 * Callback function to define the list of required dependencies
 *
 * @returns {Promise<Set>}
 *      Promise resolving with a Set containing all dependencies
 *      that should be made available to the task.
 *      UI5 Tooling will ensure that those dependencies have been
 *      built before executing the task.
 */
module.exports.determineRequiredDependencies = async function () {
	return new Set(); // dependency resolution uses Nodes' require APIs
};

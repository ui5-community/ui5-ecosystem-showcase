const path = require("path");
const LessBuilder = require("./LessBuilder");

/**
 * Custom task to compile less files in the app folder
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/logger/Logger} parameters.log Logger instance
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {object} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @param {module:@ui5/builder.tasks.TaskUtil} [parameters.taskUtil] TaskUtil
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
module.exports = async function ({ log, workspace, dependencies, options, taskUtil }) {
	const isDebug = options?.configuration?.debug;

	// get rid of project namespace from resource path
	const localPath = `/resources/${options?.projectNamespace}`;
	const translateResourcePath = function translateResourcePath(path) {
		if (path?.startsWith(localPath)) {
			return path.substring(localPath.length);
		} else {
			return path;
		}
	};

	// determine the less files to compile from the ui5.yaml (config)
	let lessToCompile = options?.configuration?.lessToCompile || [];

	// handle case when the parameter is a string, e.g. lessToCompile: 'theme/style.less'
	if (typeof lessToCompile === "string") {
		lessToCompile = [lessToCompile];
	}

	if (lessToCompile.length === 0) {
		// if nothing is specified, we extract the less files to compile from the manifest
		let manifest = await (await workspace.byPath(`${localPath}/manifest.json`)).getString();
		manifest = JSON.parse(manifest);
		lessToCompile = (manifest?.["sap.ui5"]?.resources?.css || [])
			.map((style) => {
				const lessFile = style.uri ? style.uri.replace(".css", ".less") : null;
				if (lessFile) {
					if (!path.isAbsolute(lessFile)) {
						return path.posix.join(localPath, lessFile);
					}
				}
				return lessFile;
			})
			.filter((lessfile) => !!lessfile);
	}

	// find the less files in the workspace
	const lessResources = [];
	for (const glob of lessToCompile) {
		if (!path.isAbsolute(glob)) {
			lessResources.push(...((await workspace.byGlob(path.posix.join(localPath, glob))) || []));
		} else {
			lessResources.push(...((await workspace.byGlob(glob)) || []));
		}
	}

	// create a new resource collection including the workspance and the dependencies
	const readerCollection = taskUtil.resourceFactory.createReaderCollectionPrioritized({
		name: `${options.projectName} - prioritize app folder over dependencies`,
		readers: [workspace, dependencies],
	});

	// compile the found resources with the less builder
	const lessBuilder = await LessBuilder.create(readerCollection);
	const compiledResources = await Promise.all(
		lessResources.map((lessResource) => {
			isDebug && log.info(`Compiling file ${translateResourcePath(lessResource.getPath())}...`);
			return lessBuilder.build(lessResource);
		})
	);

	// finally write the compiled resources back to the workspace
	return Promise.all(
		compiledResources.map((output) => {
			isDebug && log.info(`Writing file ${translateResourcePath(output._path)}...`);
			const resource = taskUtil.resourceFactory.createResource({
				path: output._path,
				string: output.css,
			});
			return workspace.write(resource);
		})
	);
};

/**
 * Callback function to define the list of required dependencies
 *
 * @param {object} parameters The parameters
 * @param {Set} parameters.availableDependencies
 *      Set containing the names of all direct dependencies of
 *      the project currently being built.
 * @returns {Promise<Set>}
 *      Promise resolving with a Set containing all dependencies
 *      that should be made available to the task.
 *      UI5 Tooling will ensure that those dependencies have been
 *      built before executing the task.
 */
module.exports.determineRequiredDependencies = async function ({ availableDependencies }) {
	return availableDependencies;
};

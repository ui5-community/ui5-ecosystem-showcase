const path = require("path");
const less = require("less-openui5");

/**
 * Custom task to compile less files in the app folder
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/logger/Logger} parameters.log Logger instance
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @param {module:@ui5/builder.tasks.TaskUtil} [parameters.taskUtil] TaskUtil
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
module.exports = async function ({ log, workspace, dependencies, options, taskUtil }) {
	const isDebug = options?.configuration?.debug;
	const localPath = `/resources/${options?.projectNamespace}`;

	let manifest = await (await workspace.byPath(`${localPath}/manifest.json`)).getString();
	manifest = JSON.parse(manifest);

	const translateResourcePath = function translateResourcePath(path) {
		if (path?.startsWith(localPath)) {
			return path.substring(localPath.length);
		} else {
			return path;
		}
	};

	let lessToCompile = options?.configuration?.lessToCompile || [];
	if (lessToCompile.length === 0 && manifest?.["sap.ui5"]?.resources?.css) {
		lessToCompile = manifest["sap.ui5"].resources.css
			.map((style) => {
				const lessFile = style.uri ? style.uri.replace(".css", ".less") : null;
				if (lessFile) {
					if (!path.isAbsolute(lessFile)) {
						return path.join(localPath, lessFile);
					}
				}
				return lessFile;
			})
			.filter((lessfile) => !!lessfile);
	}

	const lessResources = [];
	for (const glob of lessToCompile) {
		lessResources.push(...((await workspace.byGlobSource(glob)) || []));
	}

	const { default: fsInterface } = await import("@ui5/fs/fsInterface");

	const customCombo = taskUtil.resourceFactory.createReaderCollectionPrioritized({
		name: `${options.projectName} - prioritize app folder over dependencies`,
		readers: [workspace, dependencies],
	});

	const lessBuilder = new less.Builder({ fs: fsInterface(customCombo) });
	const compileLess = async function (lessResource) {
		return {
			lessResource,
			output: await lessBuilder.build({
				lessInputPath: lessResource.getPath(),
			}),
		};
	};

	const compiledResources = await Promise.all(
		lessResources.map((lessResource) => {
			isDebug && log.info(`Compiling file ${translateResourcePath(lessResource.getPath())}...`);
			return compileLess(lessResource);
		})
	);

	return Promise.all(
		compiledResources.map(({ lessResource, output }) => {
			isDebug && log.info(`Writing file ${translateResourcePath(lessResource.getPath())}...`);
			const resource = taskUtil.resourceFactory.createResource({
				path: lessResource.getPath().replace(/(.*).less/, "$1.css"),
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

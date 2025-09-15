/**
 * Task to flatten the library folder structure.
 * This is required for deployments to SAP NetWeaver.
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/logger/Logger} parameters.log Logger instance
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/builder.tasks.TaskUtil} [parameters.taskUtil] TaskUtil
 * @param {object} parameters.options Options
 * @param {object} parameters.options.projectName Project name
 * @param {object} parameters.options.projectNamespace Project namespace
 * @returns {Promise<undefined>} Promise resolving with undefined once data has been written
 */
module.exports = async function ({ log, workspace, taskUtil, options }) {
	if (!taskUtil.isRootProject()) {
		// Flattening is only done when library is built as root project
		log.info(`Skipping execution. Current project '${options.projectName}' is not the root project.`);
		return;
	}

	if (!options.projectNamespace) {
		throw new Error("ui5-task-flatten-library: Missing required project namespace");
	}

	const libraryResourcesPrefix = `/resources/${options.projectNamespace}/`;
	const testResourcesPrefix = "/test-resources/";
	const allWorkspaceResources = await workspace.byGlob("/**/*");

	await Promise.all(
		allWorkspaceResources.map(async (resource) => {
			if (taskUtil.getTag(resource, taskUtil.STANDARD_TAGS.OmitFromBuildResult)) {
				// Resource should not be part of the build result
				// Therefore no need to flatten it
				return;
			}
			// Tag all resources to be omitted from the build result (based on current resource path)
			taskUtil.setTag(resource, taskUtil.STANDARD_TAGS.OmitFromBuildResult);

			const resourcePath = resource.getPath();

			if (resourcePath.startsWith(libraryResourcesPrefix)) {
				const flatPath = resourcePath.substr(libraryResourcesPrefix.length - 1);
				resource.setPath(flatPath);
				await workspace.write(resource);
			} else if (resourcePath.startsWith(testResourcesPrefix)) {
				// /test-resources files won't be written to the build result
				log.verbose(`Omitting ${resourcePath} from build result. File is part of /test-resources.`);
				return;
			} else {
				// File doesn't adhere to project namespace
				log.warn(`Omitting ${resourcePath} from build result. File is not within project namespace '${options.projectNamespace}'.`);
			}
		}),
	);
};

/**
 * Callback function to define the list of required dependencies
 *
 * @returns {Promise<Set>}
 *      Promise resolving with a Set containing all dependencies
 *      that should be made available to the task.
 *      UI5 CLI will ensure that those dependencies have been
 *      built before executing the task.
 */
module.exports.determineRequiredDependencies = async function () {
	return new Set();
};

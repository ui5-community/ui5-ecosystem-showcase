/**
 * Task to flatten the library folder structure.
 * This is required for deployments to SAP NetWeaver.
 *
 * @param {object} parameters
 *
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies
 *      Reader to access resources of the project's dependencies
 * @param {@ui5/logger/Logger} parameters.log
 *      Logger instance for use in the custom task.
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName
 *      Name of the project currently being built
 * @param {string} parameters.options.projectNamespace
 *      Namespace of the project currently being built
 * @param {string} parameters.options.configuration
 *      Custom task configuration, as defined in the project's ui5.yaml
 * @param {string} parameters.options.taskName
 *      Name of the custom task.
 * @param {@ui5/builder.tasks.TaskUtil} parameters.taskUtil
 *      Specification Version-dependent interface to a TaskUtil instance.
 *      See the corresponding API reference for details:
 *      https://sap.github.io/ui5-tooling/v3/api/@ui5_project_build_helpers_TaskUtil.html
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace
 *      Reader/Writer to access and modify resources of the
 *      project currently being built
 * @returns {Promise<undefined>}
 *      Promise resolving once the task has finished
 */
export default async function ({ log, options, taskUtil, workspace }) {
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
		})
	);
}

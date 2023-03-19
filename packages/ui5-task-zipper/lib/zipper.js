const path = require("path");
const yazl = require("yazl");
const resourceFactory = require("@ui5/fs").resourceFactory;
const log = require("@ui5/logger").getLogger("builder:customtask:zipper");

/**
 * Zips the application content of the output folder
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} parameters.options.projectNamespace Project namespace
 * @param {string} [parameters.options.archiveName] ZIP archive name (defaults to project namespace)
 * @param {string} [parameters.options.additionalFiles] List of additional files to be included
 * @param {object} parameters.taskUtil the task utilities
 * @returns {Promise<undefined>} Promise resolving with undefined once data has been written
 */
module.exports = async function ({ workspace, dependencies, options, taskUtil }) {
	const { OmitFromBuildResult } = taskUtil.STANDARD_TAGS;

	// debug mode?
	const isDebug = options?.configuration?.debug;

	// determine the name of the ZIP archive (either from config or from project namespace)
	const defaultName = options && options.configuration && options.configuration.archiveName;
	const includeDependencies = options && options.configuration && options.configuration.includeDependencies;
	const onlyZip = options && options.configuration && options.configuration.onlyZip;
	const zipName = `${defaultName || options.projectNamespace.replace(/\//g, "")}.zip`;

	// retrieve the resource path prefix (to get all application resources)
	const prefixPath = `/resources/${options.projectNamespace}/`;

	// get all application related resources
	let allResources;
	try {
		const ws = await workspace.byGlob(`${prefixPath}/**`);
		allResources = ws;
		if (includeDependencies) {
			const dep = await dependencies.byGlob(`**`);
			allResources = [...ws, ...dep];
		}
	} catch (e) {
		log.error(`Couldn't read resources: ${e}`);
	}

	// create the ZIP archive and add the resources
	const zip = new yazl.ZipFile();
	try {
		// include the application related resources
		await Promise.all(
			allResources.map((resource) => {
				if (taskUtil.getTag(resource, taskUtil.STANDARD_TAGS.OmitFromBuildResult)) {
					// resource should not be part of the build result -> no need to include it in the zip
					return;
				}
				if (onlyZip) {
					taskUtil.setTag(resource, OmitFromBuildResult, true);
				}
				return resource.getBuffer().then((buffer) => {
					isDebug && log.info(`Adding ${resource.getPath()} to archive.`);
					zip.addBuffer(buffer, resource.getPath().replace(prefixPath, "").replace(/^\//, "")); // Replace first forward slash at the start of the path
				});
			})
		);
		// include the additional files from the project
		const additionalFiles = options?.configuration?.additionalFiles;
		if (Array.isArray(additionalFiles) && additionalFiles.length > 0) {
			additionalFiles.forEach((fileName) => {
				isDebug && log.info(`Adding ${fileName} to archive.`);
				zip.addFile(path.join(process.cwd(), fileName), fileName);
			});
		} else if (typeof additionalFiles === "object") {
			for (const [filePathSource, filePathTarget] of Object.entries(additionalFiles)) {
				isDebug && log.info(`Adding ${filePathSource} to archive at path ${filePathTarget}.`);
				zip.addFile(path.join(process.cwd(), filePathSource), filePathTarget || filePathSource);
			}
		}
	} catch (e) {
		log.error(`Couldn't add all resources to the archive: ${e}`);
		throw e;
	} finally {
		zip.end();
	}

	const res = resourceFactory.createResource({
		path: `/${zipName}`,
		stream: zip.outputStream,
	});

	return workspace.write(res).then(() => {
		log.verbose(`Created ${zipName} file.`);
	});
};

/**
 * Callback function to define the list of required dependencies
 *
 * @param {object} parameters The parameters
 * @param {Set} parameters.availableDependencies
 *      Set containing the names of all direct dependencies of
 *      the project currently being built.
 * @param {object} parameters.options
 *      Identical to the options given to the standard task function.
 * @returns {Promise<Set>}
 *      Promise resolving with a Set containing all dependencies
 *      that should be made available to the task.
 *      UI5 Tooling will ensure that those dependencies have been
 *      built before executing the task.
 */
module.exports.determineRequiredDependencies = async function ({ availableDependencies, options }) {
	const includeDependencies = options && options.configuration && options.configuration.includeDependencies;
	if (includeDependencies) {
		return availableDependencies;
	} else {
		return new Set();
	}
};

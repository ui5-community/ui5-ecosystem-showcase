const path = require("path");
const yazl = require("yazl");

/**
 * Determines the project name from the given resource collection.
 *
 * <b>ATTENTION: this is a hack to be compatible with UI5 tooling 2.x and 3.x</b>
 *
 * @param {module:@ui5/fs.AbstractReader} collection Reader or Collection to read resources of the root project and its dependencies
 * @returns {string} project name
 */
const determineProjectName = (collection) => {
	let projectName;
	if (collection?._readers) {
		for (const _reader of collection._readers) {
			projectName = determineProjectName(_reader);
			if (projectName) break;
		}
	}
	// /* V2 */ reader?._project?.metadata?.name || /* V3 */ reader?._readers?.[0]?._project?._name
	return projectName || collection._project?._name /* UI5 tooling 3.x */ || collection._project?.metadata?.name; /* UI5 tooling 2.x */
};

/**
 * Turn absolute data source paths in the into relative paths (for manifest.json and Component-preload.js)
 *
 * @param {object} content of the manifest
 * returns {object} modified content of the manifest
 */
const absoluteToRelativePaths = (manifest) => {
	if (manifest["sap.app"]["dataSources"]) {
		for (const [dataSourceName, dataSource] of Object.entries(manifest["sap.app"]["dataSources"])) {
			if (dataSource.uri?.substring(0, 1) === "/") {
				manifest["sap.app"]["dataSources"][dataSourceName].uri = dataSource.uri.substring(1);
			}
		}
	}
	return manifest;
};

/**
 * Zips the application content of the output folder
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/logger/Logger} parameters.log Logger instance
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} parameters.options.projectNamespace Project namespace
 * @param {object} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @param {string} [parameters.options.configuration.archiveName] ZIP archive name (defaults to project namespace)
 * @param {string} [parameters.options.configuration.additionalFiles] List of additional files to be included
 * @param {object} parameters.taskUtil the task utilities
 * @returns {Promise<undefined>} Promise resolving with undefined once data has been written
 */
module.exports = async function ({ log, workspace, dependencies, options, taskUtil }) {
	const { OmitFromBuildResult } = taskUtil.STANDARD_TAGS;

	// debug mode?
	const isDebug = options?.configuration?.debug;

	// turn absolute paths into relative paths?
	const relativePaths = options?.configuration?.relativePaths;

	// determine the name of the ZIP archive (either from config or from project namespace)
	const defaultName = options && options.configuration && options.configuration.archiveName;
	const includeDependencies = options && options.configuration && options.configuration.includeDependencies;
	const onlyZip = options && options.configuration && options.configuration.onlyZip;
	const zipName = `${defaultName || options.projectNamespace.replace(/\//g, "")}.zip`;

	// determine the dependencies resource collection to be included
	const deps =
		includeDependencies === true
			? dependencies
			: taskUtil.resourceFactory.createReaderCollection({
					readers: !includeDependencies
						? []
						: dependencies._readers.filter((reader) => {
								const projectName = determineProjectName(reader);
								return includeDependencies.indexOf(projectName) !== -1;
							}),
					name: "Filtered reader collection of ui5-task-zipper",
				});

	// retrieve the resource path prefix (to get all application resources)
	const prefixPath = `/resources/${options.projectNamespace}/`;

	// get all application related resources
	let allResources;
	try {
		const wsResources = await workspace.byGlob(`/resources/**`);
		const depResources = await deps.byGlob(`**`);
		allResources = [...wsResources, ...depResources];
	} catch (e) {
		log.error(`Couldn't read resources: ${e}`);
	}

	// create the ZIP archive and add the resources
	const zip = new yazl.ZipFile();
	try {
		// include the application related resources
		const zipEntries = [];
		await Promise.all(
			allResources.map((resource) => {
				if (taskUtil.getTag(resource, OmitFromBuildResult)) {
					// resource should not be part of the build result -> no need to include it in the zip
					return;
				}
				if (onlyZip) {
					taskUtil.setTag(resource, OmitFromBuildResult, true);
				}
				const resourcePath = resource.getPath().replace(prefixPath, "").replace(/^\//, "");
				if (!zipEntries.includes(resourcePath)) {
					zipEntries.push(resourcePath);
					return resource.getBuffer().then((buffer) => {
						isDebug && log.info(`Adding ${resource.getPath()} to archive.`);
						if (relativePaths && resourcePath === "manifest.json") {
							let manifest = JSON.parse(buffer.toString("utf-8"));
							manifest = absoluteToRelativePaths(manifest);
							zip.addBuffer(Buffer.from(JSON.stringify(manifest, null, 4), "utf-8"), "manifest.json");
						} else if (relativePaths && resourcePath === "Component-preload.js") {
							const oldPreload = buffer.toString("utf-8");
							const manifestStart = oldPreload.indexOf("manifest.json\":'{");
							const manifestEnd = oldPreload.indexOf("}'", manifestStart);
							const oldManifest = oldPreload.substring(manifestStart + 16, manifestEnd + 1);
							const oldManifestNoEscapedSingleQuotes = oldManifest.replace(/\\'/g, "REPLACE_WITH_ESCAPED_SINGLE_QUOTE");
							const newManifest = absoluteToRelativePaths(JSON.parse(oldManifestNoEscapedSingleQuotes));
							const newManifestEscapedSingleQuotes = JSON.stringify(newManifest).replace(/REPLACE_WITH_ESCAPED_SINGLE_QUOTE/g, "\\'");
							const newPreload = oldPreload.replace(oldManifest, newManifestEscapedSingleQuotes);
							zip.addBuffer(Buffer.from(newPreload, "utf-8"), "Component-preload.js");
						} else {
							zip.addBuffer(buffer, resourcePath); // Replace first forward slash at the start of the path
						}
					});
				} else {
					log.warn(`Duplicate resource path found: ${resourcePath}! Skipping...`);
				}
			}),
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

	const res = taskUtil.resourceFactory.createResource({
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
	const includeDependencies = options?.configuration?.includeDependencies;
	if (includeDependencies) {
		if (Array.isArray(includeDependencies)) {
			availableDependencies.forEach((depName) => {
				if (includeDependencies.indexOf(depName) === -1) {
					availableDependencies.delete(depName);
				}
			});
		}
		return availableDependencies;
	} else {
		return new Set();
	}
};

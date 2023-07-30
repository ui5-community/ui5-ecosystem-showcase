const less = require("less-openui5");
const minimatch = require("minimatch");

/**
 * Custom task to compile less files in the app folder
 *
 * @param {Array} lessResources Array of objects containing the less resource and the corresponding project resource path
 * @param {fsInterface} fs Node.js styled file system interface
 * @param {boolean} isDebug Flag indicating debug mode
 * @returns {Promise<Array>} Promise resolving with the created css resources
 * @private
 */
async function compileLess(lessResources, fs, resourceFactory, isDebug, log) {
	const lessBuilder = new less.Builder({ fs });

	return Promise.all(
		lessResources.map((lessResource) => {
			const appFolderPath = lessResource.resource.getPath();
			isDebug && log.info(`Compiling file ${lessResource.projectResourcePath}...`);
			return lessBuilder
				.build({
					lessInputPath: appFolderPath,
				})
				.then((output) =>
					resourceFactory.createResource({
						path: lessResource.projectResourcePath.replace(/(.*).less/, "$1.css"),
						string: output.css,
					})
				)
				.catch((error) => log.error(error));
		})
	);
}

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
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
module.exports = async function ({ log, workspace, dependencies, options, taskUtil }) {
	const appFolderPath = (options.configuration && options.configuration.appFolderPath) || "webapp";

	const isDebug = options.configuration && options.configuration.debug;

	let manifest = await (await workspace.byPath(`/resources/${options.projectNamespace}/manifest.json`)).getString();
	manifest = JSON.parse(manifest);

	let lessToCompile = (options.configuration && options.configuration.lessToCompile) || [];
	if (lessToCompile.length === 0 && manifest && manifest["sap.ui5"] && manifest["sap.ui5"].resources && manifest["sap.ui5"].resources.css) {
		lessToCompile = manifest["sap.ui5"].resources.css.map((style) => (style.uri ? style.uri.replace(".css", ".less") : null)).filter((lessfile) => !!lessfile);
	}

	const { default: DuplexCollection } = await import("@ui5/fs/DuplexCollection");
	const { default: FileSystem } = await import("@ui5/fs/adapters/FileSystem");
	const { default: Memory } = await import("@ui5/fs/adapters/Memory");
	const { default: ReaderCollectionPrioritized } = await import("@ui5/fs/ReaderCollectionPrioritized");
	const { default: fsInterface } = await import("@ui5/fs/fsInterface");

	//create custom duplex collection where the webapp is in the "/" folder
	//By default when building the workspace reader is in the vir dir "/resources/{namespace}
	//This needs to be done so that the less in the serve version and the build version can use the same paths to external resources
	let appFolderWorkspace = new DuplexCollection({
		reader: new FileSystem({
			virBasePath: "/",
			fsBasePath: appFolderPath,
		}),
		writer: new Memory({
			virBasePath: "/",
		}),
	});

	const customCombo = new ReaderCollectionPrioritized({
		name: `${options.projectName} - prioritize app folder over dependencies`,
		readers: [appFolderWorkspace, dependencies],
	});

	const lessResourcesProjectWorkspace = await workspace.byGlobSource("**/*.less");
	let lessResourcesAppFolderWorkspace = await appFolderWorkspace.byGlobSource("**/*.less");

	// apply include patterns
	lessResourcesAppFolderWorkspace = lessResourcesAppFolderWorkspace.filter((appFolderResource) => {
		const resourcePath = appFolderResource.getPath();
		return lessToCompile.some((excludePattern) => resourcePath.includes(excludePattern) || minimatch(resourcePath.slice(1), excludePattern));
	});

	const lessResources = lessResourcesAppFolderWorkspace.map((appFolderResource) => {
		const lessResourceProjectWorkspace = lessResourcesProjectWorkspace.find((projectResource) => projectResource.getPath().includes(appFolderResource.getPath()));
		return {
			projectResourcePath: lessResourceProjectWorkspace.getPath(),
			resource: appFolderResource,
		};
	});

	const compiledResources = await compileLess(lessResources, fsInterface(customCombo), taskUtil.resourceFactory, isDebug, log);

	return Promise.all(
		compiledResources.map((resource) => {
			isDebug && log.info(`Writing file ${resource.getPath()}...`);
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

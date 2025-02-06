/**
 * moves all files except the index.html into a subfolder with a timestamp as its name "~1234241421~"
 * and adjusts the data-sap-ui-resourceroots='{"my.app": "./~1234241421~/"} in the script tag of the index.html
 * relevant for standalone applications
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write resources
 * @param {object} parameters.taskUtil Specification Version dependent interface to a
 *                [TaskUtil]{@link module:@ui5/builder.tasks.TaskUtil} instance
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.projectNamespace] Project namespace
 * @param {object} [parameters.options.configuration] Task configuration if given in ui5.yaml; possible is debug : true|false
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written or rejecting in case of an error
 */
module.exports = async function ({ workspace, /* dependencies,*/ taskUtil, options }) {
	if (!options.projectNamespace) {
		throw new Error("ui5-cachebuster: Missing required project namespace");
	}
	const isDebug = options?.configuration?.debug === undefined ? false : options.configuration.debug;
	const moveResources = options?.configuration?.moveResources === undefined ? true : options.configuration.moveResources; //TODO default true ok?

	const excludeResources = moveResources && options?.configuration?.excludeFromMove && Array.isArray(options.configuration.excludeFromMove) ? options.configuration.excludeFromMove : ["index.html"];
	isDebug && console.log(`exclude from move: ${excludeResources}`);
	const resourcesPrefix = `/resources/${options.projectNamespace}/`;
	const timestamp = Date.now();

	// in index.html change the data-sap-ui-resourceroots='{"my.app": "./~1234241421~/"} in the script tag
	await workspace
		.byPath(`${resourcesPrefix}index.html`)
		.then((indexResource) => {
			isDebug && console.log(`found: ${indexResource.getPath()}`);
			return indexResource
				.getString()
				.then((content) => {
					//TODO also for data-sap-ui-theme-roots ??
					const sRegex = /(data-sap-ui-resource-?roots)[\s]*=[\s]*'(.*?)'/is;
					const mParts = content.match(sRegex);
					const sResourceRoots = mParts?.[2]; //captureGroup at index 2 in match result
					if (sResourceRoots) {
						var oResouceRoots = JSON.parse(sResourceRoots);
						const aModuleNames = Object.keys(oResouceRoots);
						aModuleNames.forEach((sModuleName) => {
							var sModulePath = oResouceRoots[sModuleName];
							// assumes all paths are relative aka. start with "."
							sModulePath = sModulePath.replace(/^\.\/?/, `./~${timestamp}~/`);
							oResouceRoots[sModuleName] = sModulePath;
						});

						var changed = content.replace(sRegex, `${mParts[1]}='${JSON.stringify(oResouceRoots)}'`);
						indexResource.setString(changed);
						return workspace.write(indexResource);
					}
				})
				.then(() => {
					isDebug && console.log("updated index.html");
				});
		})
		.catch((e) => {
			throw new Error(`ui5-cachebuster: Could not update index.html: ${e}`);
		});

	if (moveResources) {
		await workspace
			.byGlob(`${resourcesPrefix}**`)
			.then((aResources) => {
				aResources = aResources.filter((elem) => {
					// filter out the resources which should not be moved
					var path = elem.getPath().split(resourcesPrefix).pop();
					return !excludeResources.includes(path);
				});
				isDebug && console.log(`number of resources to move: ${aResources.length}`);
				return Promise.all(
					aResources.map((resource) => {
						var resourcePath = resource.getPath();
						var filePath = resourcePath.split(resourcesPrefix).pop();

						isDebug && console.log(`move resource: ${resourcePath}`);
						//if (dublicateResources.length>0){
						//  dublicateResources.forEach((res)=>{
						//      if(!resourcePath.includes(res)) { //dublicate eg. manifest to pass deployment validation checks
						//          taskUtil.setTag(resource, taskUtil.STANDARD_TAGS.OmitFromBuildResult); //excludes from build result
						//      }
						//  })} else taskUtil.setTag(resource, taskUtil.STANDARD_TAGS.OmitFromBuildResult);
						taskUtil.setTag(resource, taskUtil.STANDARD_TAGS.OmitFromBuildResult); //excludes from build result
						return resource.clone().then((copy) => {
							copy.setPath(`${resourcesPrefix}~${timestamp}~/${filePath}`);
							return workspace.write(copy).then(() => {
								isDebug && console.log(`moved: ${copy.getPath()}`);
							});
						});
					}),
				);
			})
			.catch((e) => {
				throw new Error(`ui5-cachebuster: Could not move resources: ${e}`);
			});
	}
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
	return new Set();
};

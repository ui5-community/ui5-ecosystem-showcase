/* eslint-disable jsdoc/check-param-names */
const log = require("@ui5/logger").getLogger("builder:customtask:ui5-tooling-transpile");
const path = require("path");
const fs = require("fs");
const resourceFactory = require("@ui5/fs").resourceFactory;
const {
	createConfiguration,
	createBabelConfig,
	normalizeLineFeeds,
	determineResourceFSPath,
	transformAsync
} = require("./util");

/**
 * Custom task to transpile resources to JavaScript modules.
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {object} parameters.taskUtil Specification Version dependent interface to a
 *                [TaskUtil]{@link module:@ui5/builder.tasks.TaskUtil} instance
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.projectNamespace] Project namespace if available
 * @param {string} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
module.exports = async function ({ workspace /*, dependencies*/, taskUtil, options }) {
	const config = createConfiguration(options?.configuration || {});
	const babelConfig = await createBabelConfig({ configuration: config, isMiddleware: false });

	// TODO: should we accept the full glob pattern as param or just the file pattern?
	const allResources = await workspace.byGlob(`/**/*${config.filePattern}`);

	// transpile the TypeScript resources and collect the code
	const sourcesMap = {};
	await Promise.all(
		allResources.map(async (resource) => {
			const resourcePath = resource.getPath();

			// Ignore files that match the excludePatterns configuration
			if (
				!config.excludes.some((pattern) => resourcePath.includes(pattern)) ||
				config.includes.some((pattern) => resourcePath.includes(pattern))
			) {
				const filePath = resourcePath.replace(new RegExp("\\.[^.]+$"), ".js");

				// read source file
				const source = await resource.getString();

				// store the ts source code in the sources map
				if (config.transformTypeScript) {
					sourcesMap[resourcePath] = source;
				}

				// we ignore d.ts files for transpiling
				if (!resourcePath.endsWith(".d.ts")) {
					// mark TypeScript source for omit from build result
					if (resourcePath.endsWith(".ts")) {
						taskUtil.setTag(resource, taskUtil.STANDARD_TAGS.OmitFromBuildResult, true);
					}

					// transpile the source
					config.debug && log.info(`Transpiling resource ${resourcePath}`);
					const result = await transformAsync(
						source,
						Object.assign({}, babelConfig, {
							filename: determineResourceFSPath(resource) // necessary for source map <-> source assoc
						})
					);

					// create the ts file in the workspace
					const transpiledResource = resourceFactory.createResource({
						path: filePath,
						string: normalizeLineFeeds(result.code)
					});
					workspace.write(transpiledResource);

					// create sourcemap resource if available
					if (result.map) {
						result.map.file = path.basename(filePath);
						config.debug && log.info(`  + sourcemap ${filePath}.map`);

						const resourceMap = resourceFactory.createResource({
							path: `${filePath}.map`,
							string: JSON.stringify(result.map)
						});

						workspace.write(resourceMap);
					}
				}
			}
		})
	);

	// generate the dts files for the ts files
	if (config.transformTypeScript) {
		// determine if the project is a library and enable the DTS generation by default
		// TODO: UI5 Tooling 3.0 allows to access the project with the TaskUtil
		//       https://sap.github.io/ui5-tooling/v3/api/@ui5_project_build_helpers_TaskUtil.html#~ProjectInterface
		//       from here we could derive the project type instead of guessing via file existence
		const libraryResources = await workspace.byGlob(`/resources/${options.projectNamespace}/*library*`);
		if (libraryResources.length > 0 && config.generateDts === undefined) {
			config.debug && log.info(`Enabling d.ts generation by default for library projects!`);
			config.generateDts = true;
		}

		// generate the dts files for the ts files
		if (config.generateDts) {
			try {
				// dynamically require typescript
				const ts = require("typescript");

				// options to generate d.ts files only
				const options = {
					allowJs: true,
					declaration: true,
					//declarationMap: true,
					emitDeclarationOnly: true
					//traceResolution: true,
				};

				// update the sources map to declare the modules with the full module name
				for await (const resourcePath of Object.keys(sourcesMap)) {
					const source = sourcesMap[resourcePath];
					let moduleName = /^\/resources\/(.*)\.ts$/.exec(resourcePath)?.[1];
					if (moduleName?.endsWith(".gen.d")) {
						// we assume that each "*.gen.d.ts" is generated by the @ui5/ts-interface-generator
						// and as the generated interfaces include a "declare module" definition we need to
						// move the "declare module" to the root and use the fully qualified module name
						moduleName = /^(.*)\.gen\.d$/.exec(moduleName)[1];
						sourcesMap[resourcePath] = `declare module "${moduleName}" {\n${source.replace(
							/\ndeclare module "[^"]+" {\n/,
							""
						)}`;
						const resource = await workspace.byPath(resourcePath);
						resource.setString(sourcesMap[resourcePath]);
						workspace.write(resource);
					} else if (moduleName) {
						sourcesMap[resourcePath] = `declare module "${moduleName}" {\n${source}\n}`;
					}
				}

				// Create a Program with an in-memory emit
				const host = ts.createCompilerHost(options);
				(host.getCurrentDirectory = () => ""),
					(host.fileExists = (file) => !!sourcesMap[file] || fs.existsSync(file));
				host.readFile = (file) => sourcesMap[file] || fs.readFileSync(file, "utf-8");
				host.writeFile = function (fileName, content) {
					config.debug && log.info(`Generating d.ts for resource ${fileName}`);
					const dtsFile = resourceFactory.createResource({
						path: `${fileName}`,
						string: content
					});
					workspace.write(dtsFile);
				};
				host.resolveModuleNames = function (moduleNames, containingFile) {
					const resolvedModules = [];
					for (const moduleName of moduleNames) {
						// try to use standard resolution
						const result = ts.resolveModuleName(moduleName, containingFile, options, {
							fileExists: host.fileExists,
							readFile: host.readFile
						});
						if (result.resolvedModule) {
							// module resolved, store this info
							resolvedModules.push(result.resolvedModule);
						} else {
							// for all other modules, mark them as external library imports
							// => most probably these are the UI5 modules with the UI5 namespace
							const resolvedFileName = `/resources/${moduleName}.ts`;
							resolvedModules.push({
								resolvedFileName,
								extension: ".ts",
								isExternalLibraryImport: !sourcesMap[resolvedFileName]
							});
						}
					}
					return resolvedModules;
				};

				// prepare and emit the d.ts files
				const program = ts.createProgram(Object.keys(sourcesMap), options, host);
				const result = program.emit();

				// error diagnostics
				if (result.emitSkipped) {
					log.error(
						`The following errors occured during d.ts generation: \n${ts.formatDiagnostics(
							result.diagnostics,
							host
						)}`
					);
				}

				// create the index.d.ts in the root output folder
				if (taskUtil.isRootProject()) {
					config.debug && log.info(`Generating index.d.ts`);
					const indexDtsContent = Object.keys(sourcesMap)
						.filter((dtsFile) => dtsFile.startsWith("/resources/"))
						.map(
							(dtsFile) =>
								`/// <reference path=".${
									/\.d\.ts$/.test(dtsFile) ? dtsFile : dtsFile.replace(/\.ts$/, ".d.ts")
								}"/>`
						)
						.join("\n");
					const indexDtsFile = resourceFactory.createResource({
						path: `/index.d.ts`,
						string: indexDtsContent
					});
					workspace.write(indexDtsFile);
				}
			} catch (e) {
				// typescript dependency should be available, otherwise we can't generate the dts files
				log.warn(`Generating d.ts failed! Reason: ${e}`);
			}
		}
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

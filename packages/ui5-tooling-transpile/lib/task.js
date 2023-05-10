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
	transformAsync,
	determineProjectBasePath
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
	const cwd = determineProjectBasePath(workspace) || process.cwd();
	const config = createConfiguration(options?.configuration || {}, cwd);
	const babelConfig = await createBabelConfig({ configuration: config, isMiddleware: false }, cwd);

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

				// store the source code in the sources map
				if (config.transformTypeScript) {
					sourcesMap[resourcePath] = source;
				}

				// we ignore d.ts files for transpiling
				if (!resourcePath.endsWith(".d.ts")) {
					// transpile the source
					config.debug && log.info(`Transpiling resource ${resourcePath}`);
					const result = await transformAsync(
						source,
						Object.assign({}, babelConfig, {
							filename: determineResourceFSPath(resource) // necessary for source map <-> source assoc
						})
					);

					// create the ts file in the workspace
					config.debug && log.info(`  + [.js] ${filePath}`);
					const transpiledResource = resourceFactory.createResource({
						path: filePath,
						string: normalizeLineFeeds(result.code)
					});
					await workspace.write(transpiledResource);

					// create sourcemap resource if available
					if (result.map) {
						result.map.file = path.basename(filePath);
						config.debug && log.info(`  + [.js.map] ${filePath}.map`);

						const resourceMap = resourceFactory.createResource({
							path: `${filePath}.map`,
							string: JSON.stringify(result.map)
						});

						await workspace.write(resourceMap);
					}
				}
			}
		})
	);

	// generate the d.ts(.map)? files for the ts files via TSC API
	// for the resources of the root project (not included dependencies)
	if (config.transformTypeScript) {
		// determine if the project is a library and enable the DTS generation by default
		// TODO: UI5 Tooling 3.0 allows to access the project with the TaskUtil
		//       https://sap.github.io/ui5-tooling/v3/api/@ui5_project_build_helpers_TaskUtil.html#~ProjectInterface
		//       from here we could derive the project type instead of guessing via file existence
		const libraryResources = await workspace.byGlob(`/resources/${options.projectNamespace}/*library*`);
		const isLibrary = libraryResources.length > 0;
		if (isLibrary && config.generateDts === undefined) {
			config.debug && log.info(`Enabling d.ts generation by default for library projects!`);
			config.generateDts = true;
		}

		// omit resources from build result (unfortunately no better place found which
		// allows doing this during the iteration across all resources at another place...)
		for await (const resourcePath of Object.keys(sourcesMap)) {
			// all ts files will be omitted from the build result
			let omitFromBuildResult = resourcePath.endsWith(".ts");
			// root projects with generateDts=true will include d.ts files for build result
			if (resourcePath.endsWith(".d.ts")) {
				omitFromBuildResult = !taskUtil.isRootProject() || !config.generateDts;
			}
			// omit the resource from the build result
			if (omitFromBuildResult) {
				config.debug && log.verbose(`Omitting resource ${resourcePath}`);
				const resource = await workspace.byPath(resourcePath);
				taskUtil.setTag(resource, taskUtil.STANDARD_TAGS.OmitFromBuildResult, true);
			}
		}

		// generate the dts files for the ts files
		if (config.generateDts && taskUtil.isRootProject()) {
			try {
				// dynamically require typescript
				const ts = require("typescript");

				// options to generate d.ts files only
				const options = {
					allowJs: true,
					declaration: true,
					declarationMap: true,
					emitDeclarationOnly: true,
					sourceRoot: "."
					//traceResolution: true,
				};

				// update the sources map to declare the modules with the full module name
				for await (const resourcePath of Object.keys(sourcesMap)) {
					// declare the modules with its namespace
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
						await workspace.write(resource);
					} else if (moduleName) {
						sourcesMap[resourcePath] = `declare module "${moduleName}" {\n${source}\n}`;
					}
				}

				// array of promises (d.ts generation) to await them later
				const dtsFilePromises = [];
				const writeDtsFile = function (fileName, content) {
					const dtsFile = resourceFactory.createResource({
						path: `${fileName}`,
						string: content
					});
					dtsFilePromises.push(workspace.write(dtsFile));
				};

				// emit type definitions in-memory and read/write resources from the UI5 workspace
				const host = ts.createCompilerHost(options);
				(host.getCurrentDirectory = () => ""),
					(host.fileExists = (file) => !!sourcesMap[file] || fs.existsSync(file));
				host.readFile = (file) => sourcesMap[file] || fs.readFileSync(file, "utf-8");
				host.writeFile = function (fileName, content, writeByteOrderMark, onError, sourceFiles /*, data*/) {
					const sourceFile = sourceFiles[0]; // we typically only have one source file!
					config.debug && log.info(`  + [${/(\.d\.ts(?:\.map)?)$/.exec(fileName)[0]}] ${fileName}`);
					if (/\.d\.ts\.map$/.test(fileName)) {
						// for d.ts.map we need to fix the sources mapping in order to be
						// able to use the "Go to Source Definition" feature of VSCode
						// /!\ this solution is fragile as it assumes to be generated
						//     into a direct folder (like dist) and not in deeper structures
						//     -> to avoid the hack we need more FS infos from the tooling!
						try {
							const resourcePath = /^\//.test(sourceFile.fileName)
								? sourceFile.fileName
								: `/${sourceFile.fileName}`;
							workspace.byPath(resourcePath).then((resource) => {
								const jsonContent = JSON.parse(content);
								// libs build into namespace (resolve), applications into root (assume "..") in dist folder!
								jsonContent.sourceRoot = isLibrary ? path.relative(resource.getPath(), "/") : "..";
								jsonContent.sources = [path.relative(cwd, determineResourceFSPath(resource))];
								writeDtsFile(fileName, JSON.stringify(jsonContent));
							});
						} catch (e) {
							config.debug &&
								log.warn(`  /!\\ Failed to patch sources information of ${fileName}. Reason: ${e}`);
							// as this is a hack, we can fallback to the by default
							// generated sources information of the ts builder
							writeDtsFile(fileName, content);
						}
					} else {
						writeDtsFile(fileName, content);
					}
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

				// wait until all files are d.ts(.map)? written
				await Promise.all(dtsFilePromises);

				if (!result.emitSkipped) {
					// create the index.d.ts in the root output folder
					config.debug && log.info(`  + [.d.ts] index.d.ts`);
					const pckgJsonFile = path.join(cwd, "package.json");
					if (fs.existsSync(pckgJsonFile)) {
						const pckgJson = require(pckgJsonFile);
						if (!pckgJson.types) {
							log.warn(
								`  /!\\ package.json has no "types" property! Add it and point to "index.d.ts" in build destination!`
							);
						}
					}
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
					await workspace.write(indexDtsFile);
				} else {
					// error diagnostics
					log.error(
						`The following errors occured during d.ts generation: \n${ts.formatDiagnostics(
							result.diagnostics,
							host
						)}`
					);
				}
			} catch (e) {
				// typescript dependency should be available, otherwise we can't generate the dts files
				log.error(`Generating d.ts failed! Reason: ${e.message}\n${e.stack}`);
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

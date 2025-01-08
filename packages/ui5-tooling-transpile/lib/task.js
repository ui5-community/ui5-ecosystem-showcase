/* eslint-disable jsdoc/check-param-names */
const path = require("path");
const fs = require("fs");
const JSONC = require("comment-json");
const { pathToFileURL } = require("url");

/**
 * Custom task to transpile resources to JavaScript modules.
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/logger/Logger} parameters.log Logger instance
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {object} parameters.taskUtil Specification Version dependent interface to a
 *                [TaskUtil]{@link module:@ui5/builder.tasks.TaskUtil} instance
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.projectNamespace] Project namespace if available
 * @param {object} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
module.exports = async function ({ log, workspace /*, dependencies*/, taskUtil, options }) {
	const {
		resolveNodeModule,
		createConfiguration,
		createBabelConfig,
		normalizeLineFeeds,
		determineResourceFSPath,
		transformAsync
	} = require("./util")(log);
	const { OmitFromBuildResult } = taskUtil.STANDARD_TAGS;

	const cwd = taskUtil.getProject().getRootPath() || process.cwd();
	const config = createConfiguration({ configuration: options?.configuration || {}, isMiddleware: false }, cwd);
	const babelConfig = await createBabelConfig({ configuration: config, isMiddleware: false }, cwd);

	const { resourceFactory } = taskUtil;

	// determine root project
	const rootProject = taskUtil.getProject();

	// if the TypeScript interfaces should be created, launch the ts-interface-generator in watch mode
	if (config.generateTsInterfaces) {
		const generateTSInterfacesAPI = resolveNodeModule(
			"@ui5/ts-interface-generator/dist/generateTSInterfacesAPI",
			cwd
		);
		if (generateTSInterfacesAPI) {
			const { main } = require(generateTSInterfacesAPI);
			try {
				// disable the clearScreen for watchMode for regular build
				const tsModule = resolveNodeModule("typescript", cwd);
				const ts = require(tsModule);
				const originalClearScreen = ts.sys.clearScreen;
				ts.sys.clearScreen = () => {};
				// run the interface generator
				config.debug && log.info(`Executing "@ui5/ts-interface-generator"...`);
				main({
					//logLevel: config.debug ? log.constructor.getLevel() : "error",
					config: path.join(cwd, "tsconfig.json")
				});
				// reset the clear screen function
				ts.sys.clearScreen = originalClearScreen;
			} catch (e) {
				log.error(e);
			}
		} else {
			config.debug &&
				log.warn(
					`Missing dependency "@ui5/ts-interface-generator"! TypeScript interfaces will not be generated until dependency has been added...`
				);
		}
	}

	// replace the version in all files handled by this task because this plugin handles additional file types
	// which are not supported by the replaceVersion task of the UI5 Tooling (hardcoded some selected file types)
	// (HINT: do this a bit loosely coupled for now to avoid tight dependencies to UI5 Tooling)
	// Also check for @ui5/builder under @ui5/cli to avoid issues with the module resolution
	try {
		// dynamically require the replaceVersion task
		// (using the absolute path to the module to avoid issues with the module resolution)
		const replaceVersion = (
			await import(
				pathToFileURL(
					require.resolve("@ui5/builder/tasks/replaceVersion", {
						paths: [cwd, path.dirname(require.resolve("@ui5/cli/package.json"))]
					})
				)
			)
		).default;
		// replace the versions for all supported file types
		// using the central replaceVersion task of the UI5 Tooling
		await replaceVersion({
			workspace,
			options: {
				pattern: `**/*${config.filePattern}`,
				version: rootProject.getVersion()
			}
		});
	} catch (e) {
		log.error(`Failed to replace the version in the TypeScript files!\nReason: ${e}`);
	}

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
					let string = result.code;

					// create sourcemap resource if available
					if (result.map) {
						result.map.file = path.basename(filePath);
						config.debug && log.info(`  + [.js.map] ${filePath}.map`);

						const resourceMap = resourceFactory.createResource({
							path: `${filePath}.map`,
							string: normalizeLineFeeds(JSON.stringify(result.map))
						});

						await workspace.write(resourceMap);

						// append the source mapping url to the resource string
						string += `\n//# sourceMappingURL=${result.map.file}.map`;
					}

					const transpiledResource = resourceFactory.createResource({
						path: filePath,
						string: normalizeLineFeeds(string)
					});
					await workspace.write(transpiledResource);
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
			// all ts files will be omitted from the build result (if set in config)
			let omitFromBuildResult = resourcePath.endsWith(".ts") && config.omitTSFromBuildResult;
			// root projects with generateDts=true will include d.ts files for build result
			if (resourcePath.endsWith(".d.ts")) {
				omitFromBuildResult = !taskUtil.isRootProject() || !config.generateDts;
			}
			// omit the resource from the build result
			if (omitFromBuildResult) {
				config.debug && log.verbose(`Omitting resource ${resourcePath}`);
				const resource = await workspace.byPath(resourcePath);
				taskUtil.setTag(resource, OmitFromBuildResult, true);
			}
		}

		// generate the dts files for the ts files
		if (config.generateDts && taskUtil.isRootProject()) {
			try {
				// dynamically require typescript
				const tsPath = resolveNodeModule("typescript", cwd);
				const ts = require(tsPath);

				// read the tsconfig.json
				const tsConfigFile = path.join(cwd, "tsconfig.json");
				let tsOptions = {};
				if (fs.existsSync(tsConfigFile)) {
					tsOptions = JSONC.parse(fs.readFileSync(tsConfigFile, { encoding: "utf8" }));
				}

				// options to generate d.ts files only
				const options = Object.assign({}, tsOptions, {
					allowJs: true,
					declaration: true,
					declarationMap: true,
					emitDeclarationOnly: true,
					sourceRoot: "."
					//traceResolution: true,
				});

				// update the sources map to declare the modules with the full module name
				for await (const resourcePath of Object.keys(sourcesMap)) {
					// declare the modules as an ambient module (with full module namespace)
					let source = sourcesMap[resourcePath];
					let moduleName = /^\/resources\/(.*)\.ts$/.exec(resourcePath)?.[1];
					// we differentiate between ".gen.d.ts" files and regular ".ts" files
					if (moduleName?.endsWith(".gen.d")) {
						// we assume that each "*.gen.d.ts" is generated by the @ui5/ts-interface-generator
						// and as the generated interfaces include a "declare module" definition we need to
						// move the "declare module" to the root and use the fully qualified module name
						moduleName = /^(.*)\.gen\.d$/.exec(moduleName)[1];
						sourcesMap[resourcePath] = `declare module "${moduleName}" {\n${source.replace(
							/\ndeclare module "[^"]+" {\n/,
							""
						)}`;
						// update the modified resource
						const resource = await workspace.byPath(resourcePath);
						resource.setString(sourcesMap[resourcePath]);
						await workspace.write(resource);
					} else if (moduleName) {
						// rewrite all imports with their fully qualified name
						const relativeModulePaths = [...source.matchAll(/import.+("\.{1,2}[^"]+"|'\.{1,2}[^']+')/g)];
						relativeModulePaths.forEach((reModPath) => {
							const relativePath = reModPath[1].slice(1, -1);
							source = source.replaceAll(
								reModPath[0],
								reModPath[0].replaceAll(relativePath, path.posix.join(moduleName, "..", relativePath))
							);
						});
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
				const typeDefs = {};
				const host = ts.createCompilerHost(options);
				(host.getCurrentDirectory = () => cwd),
					(host.fileExists = (file) => !!sourcesMap[file] || fs.existsSync(file));
				host.readFile = (file) => {
					if (/\/package.json$/g.test(file)) {
						if (!typeDefs[file]) {
							try {
								const typeDefPkgJson = JSON.parse(fs.readFileSync(file, { encoding: "utf8" }));
								typeDefs[file] = typeDefPkgJson;
								// eslint-disable-next-line no-unused-vars
							} catch (err) {
								/* ignore the error */
							}
						}
					}
					return sourcesMap[file] || fs.readFileSync(file, "utf-8");
				};
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
						const pckgJson = JSON.parse(fs.readFileSync(pckgJsonFile, { encoding: "utf8" }));
						if (!pckgJson.types) {
							log.warn(
								`  /!\\ package.json has no "types" property! Add it and point to "index.d.ts" in build destination!`
							);
						}
					}
					// determine the virtual resource base path
					let virBasePath = `/resources/${rootProject.getNamespace()}`;
					// generate the index.d.ts content
					const indexDtsContent = Object.keys(sourcesMap)
						.filter((dtsFile) => dtsFile.startsWith("/resources/"))
						.map((dtsFile) => {
							// if the dts file is in the virtual base path, we strip the path
							if (!isLibrary && dtsFile.startsWith(virBasePath)) {
								dtsFile = dtsFile.substring(virBasePath.length);
							}
							// create the reference line
							return `/// <reference path=".${
								/\.d\.ts$/.test(dtsFile) ? dtsFile : dtsFile.replace(/\.ts$/, ".d.ts")
							}"/>`;
						});
					const typeDefPkgJsons = Object.values(typeDefs);
					typeDefPkgJsons.forEach((typeDefPkgJson) => {
						indexDtsContent.unshift(`//   - ${typeDefPkgJson.name}@${typeDefPkgJson.version}`);
					});
					indexDtsContent.unshift(
						`// Generated with TypeScript ${ts.version || "unknown"} / ${
							rootProject.getFrameworkName() || "UI5"
						} ${rootProject.getFrameworkVersion() || "unknown"}${
							typeDefPkgJsons.length > 0 ? " using:" : ""
						}`
					);
					const indexDtsFile = resourceFactory.createResource({
						path: `/index.d.ts`,
						string: indexDtsContent.join("\n")
					});
					await workspace.write(indexDtsFile);
				} else {
					// error diagnostics
					throw new Error(
						`The following errors occured during d.ts generation: \n${ts.formatDiagnostics(
							result.diagnostics,
							host
						)}`
					);
				}
			} catch (e) {
				// typescript dependency should be available, otherwise we can't generate the dts files
				// or if a d.ts file is not valid, the generation will fail and we report the error
				log.error(`Generating d.ts failed! Reason: ${e.message}\n${e.stack}`);
				if (config.failOnDtsErrors) {
					throw e;
				}
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

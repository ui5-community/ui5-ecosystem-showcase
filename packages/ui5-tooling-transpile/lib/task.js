const log = require("@ui5/logger").getLogger("builder:customtask:ui5-tooling-transpile");
const resourceFactory = require("@ui5/fs").resourceFactory;
const { createBabelConfig, normalizeLineFeeds } = require("./util");
const path = require("path");
const fs = require("fs");
const babel = require("@babel/core");

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
	const config = options?.configuration || {};
	config.includes = config.includes || config.includePatterns || [];
	config.excludes = config.excludes || config.excludePatterns || [];

	const babelConfig = await createBabelConfig({ configuration: config, isMiddleware: false });

	let filePatternConfig = config.filePattern; // .+(ts|tsx)
	if (!filePatternConfig) {
		filePatternConfig = config.transpileTypeScript ? ".ts" : ".js";
	}

	// TODO: should we accept the full glob pattern as param or just the file pattern?
	let allResources = await workspace.byGlob(`/**/*${filePatternConfig}`);

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
				if (config.transpileTypeScript) {
					sourcesMap[resourcePath] = source;
				}

				// we ignore d.ts files for transpiling
				if (!resourcePath.endsWith(".d.ts")) {
					// mark source for omit from build result
					taskUtil.setTag(resource, taskUtil.STANDARD_TAGS.OmitFromBuildResult, true);

					// transpile the source
					config.debug && log.info(`Transpiling resource ${resourcePath}`);
					const result = await babel.transformAsync(
						source,
						Object.assign({}, babelConfig, {
							filename: resourcePath // necessary for source map <-> source assoc
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
	if (config.transpileTypeScript && !config.skipGenerateDTS) {
		try {
			// dynamically require typescript
			const ts = require("typescript");

			// options to generate d.ts files only
			const options = {
				allowJs: true,
				declaration: true,
				emitDeclarationOnly: true
				//traceResolution: true,
			};

			// Create a Program with an in-memory emit
			const host = ts.createCompilerHost(options);
			(host.getCurrentDirectory = function () {
				return "";
			}),
				(host.fileExists = function (file) {
					if (sourcesMap[file]) {
						return true;
					} else {
						return fs.existsSync(file);
					}
				});
			host.readFile = function (file) {
				if (sourcesMap[file]) {
					return sourcesMap[file];
				} else {
					return fs.readFileSync(file, "utf-8");
				}
			};
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
					let result = ts.resolveModuleName(moduleName, containingFile, options, {
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
			//const program = ts.createProgram(Object.keys(sourcesMap).filter((s) => !s.endsWith("d.ts")), options, host);
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
		} catch (e) {
			// typescript dependency should be available, otherwise we can't generate the dts files
			log.warn(`Generating d.ts failed! Reason: ${e}`);
		}
	}
};

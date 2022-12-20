const log = require("@ui5/logger").getLogger("builder:customtask:ui5-tooling-transpile");
const resourceFactory = require("@ui5/fs").resourceFactory;
const { createBabelConfig, normalizeLineFeeds } = require("./util");
const path = require("path");
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
module.exports = async function ({ workspace, dependencies, /* taskUtil,*/ options }) {
	const config = options?.configuration || {};
	config.includes = config.includes || config.includePatterns;
	config.excludes = config.excludes || config.excludePatterns;

	const babelConfig = await createBabelConfig({ configuration: config, isMiddleware: false });

	let filePatternConfig = config.filePattern; // .+(ts|tsx)
	if (!filePatternConfig) {
		filePatternConfig = config.transpileTypeScript ? ".ts" : ".js";
	}

	// TODO: should we accept the full glob pattern as param or just the file pattern?
	const allResources = await workspace.byGlob(`/**/*${filePatternConfig}`);
	if (config.transpileDependencies) {
		// TODO: does transpileDependencies make sense for JavaScript files?
		const depsResources = await dependencies.byGlob(`/**/*${filePatternConfig}`);
		allResources.push(...depsResources);
	}

	await Promise.all(
		allResources.map(async (resource) => {
			const resourcePath = resource.getPath();

			// Ignore files that match the excludePatterns configuration
			if (
				!(config.excludes || []).some((pattern) => resourcePath.includes(pattern)) ||
				(config.includes || []).some((pattern) => resourcePath.includes(pattern))
			) {
				const filePath = resourcePath.replace(new RegExp("\\.[^.]+$"), ".js");

				// read file into string
				const source = await resource.getString();

				// transpile the source
				config.debug && log.info(`Transpiling resource ${resource.getPath()}`);
				const result = await babel.transformAsync(
					source,
					Object.assign({}, babelConfig, {
						filename: resource.getPath() // necessary for source map <-> source assoc
					})
				);

				resource.setString(normalizeLineFeeds(result.code));
				resource.setPath(filePath);
				workspace.write(resource);

				// create SourceMap resource if available
				if (result.map) {
					//add the transpiled file name
					result.map.file = path.basename(filePath);
					config.debug && log.info(`  + sourcemap ${filePath}.map`);

					const resourceMap = resourceFactory.createResource({
						path: `${filePath}.map`,
						string: JSON.stringify(result.map)
					});

					workspace.write(resourceMap);
				}
			}
		})
	);
};

const log = require("@ui5/logger").getLogger("builder:customtask:ui5-tooling-transpile");
const resourceFactory = require("@ui5/fs").resourceFactory;
const { createBabelConfig, normalizeLineFeeds } = require("./util");
const babel = require("@babel/core");

/**
 * Custom task to create the UI5 AMD-like bundles for used ES imports from node_modules.
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
module.exports = async function ({
    workspace,
    dependencies,
    taskUtil,
    options
}) {
    const config = options.configuration || {};

    const babelConfig = createBabelConfig({configuration: config, isMiddleware: false});

    let filePatternConfig = config.filePattern;

    if (!filePatternConfig) {
        filePatternConfig = config.transpileTypeScript ? ".ts" : ".js";
    }

    //TODO: should we accept the full glob pattern as param or just the file pattern?
    const allResources = await workspace.byGlob(`/**/*${filePatternConfig}`);

    await Promise.all(allResources.map(async (resource) => {
        // Ignore files that match the excludePatterns configuration
        if (!(config.excludePatterns || []).some(pattern => resource.getPath().includes(pattern))) {
            const filePath = resource.getPath().replace(new RegExp("\\.[^.]+$"), ".js");

            const transpileResult = await resource.getString().then((value) => {
                config.debug && log.info("Transpiling file " + resource.getPath());

                // add source file name
                babelConfig.filename = resource.getPath();

                return babel.transformAsync(value, babelConfig);
            });

            const code = normalizeLineFeeds(transpileResult.code);
            resource.setString(code);
            resource.setPath(filePath);
			workspace.write(resource);

            // Create SourceMap File if requested
            if (transpileResult.map) {
                const filename = filePath.split("/").pop();
                //add the transpiled file name
                transpileResult.map.file = filename;

                const resourceMap = resourceFactory.createResource({
                    path: `${filePath}.map`,
                    string: JSON.stringify(transpileResult.map)
                });

                workspace.write(resourceMap);
            }
        }
    }));
};

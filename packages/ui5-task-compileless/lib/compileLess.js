const log = require("@ui5/logger").getLogger("builder:customtask:compileless");
const less = require("less-openui5");
const { ReaderCollectionPrioritized, DuplexCollection, fsInterface } = require("@ui5/fs");
const Memory = require("@ui5/fs").adapters.Memory
const FileSystem = require("@ui5/fs").adapters.FileSystem;
const resourceFactory = require("@ui5/fs/lib/resourceFactory");
const minimatch = require("minimatch");

/**
 * Custom task to compile less files in the app folder
 *
 * @param {Array} lessResources Array of objects containing the less resource and the corresponding project resource path
 * @param {module:@ui5/fs.fsInterface} fs Node.js styled file system interface
 * @param {boolean} isDebug Flag indicating debug mode
 * @returns {Promise<Array>} Promise resolving with the created css resources
 * @private
 */
function compileLess(lessResources, fs, isDebug) {
    const lessBuilder = new less.Builder({fs});

    return Promise.all(
        lessResources.map(lessResource => {
            const appFolderPath = lessResource.resource.getPath();
            isDebug && log.info(`Compiling file ${lessResource.projectResourcePath}...`);
            return lessBuilder
                .build({
                    lessInputPath: appFolderPath
                })
                .then(output => resourceFactory.createResource({
                        path: lessResource.projectResourcePath.replace(/(.*).less/, "$1.css"),
                        string: output.css
                    })
                ).catch(error => log.error(error));
        })
    );
};

/**
 * Custom task to compile less files in the app folder
 *
 * @param {Object} parameters Parameters
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {Object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
module.exports = async function({workspace, dependencies, options}) {
    const appFolderPath = options.configuration && options.configuration.appFolderPath || 'webapp';
    const lessToCompile = options.configuration && options.configuration.lessToCompile|| [] ;
    const isDebug = options.configuration && options.configuration.debug;



    //create custom duplex collection where the webapp is in the "/" folder
    //By default when building the workspace reader is in the vir dir "/resources/{namespace}
    //This needs to be done so that the less in the serve version and the build version can use the same paths to external resources
    let appFolderWorkspace = new DuplexCollection({
        reader: new FileSystem({
            virBasePath: "/",
            fsBasePath: appFolderPath
        }),
        writer: new Memory({
            virBasePath: "/"
        })
    });

    const customCombo = new ReaderCollectionPrioritized({
        name: `${options.projectName} - prioritize app folder over dependencies`,
        readers: [appFolderWorkspace, dependencies]
    });


    const lessResourcesProjectWorkspace = await workspace.byGlobSource("**/*.less");
    let lessResourcesAppFolderWorkspace = await appFolderWorkspace.byGlobSource("**/*.less");

    // apply include patterns
    lessResourcesAppFolderWorkspace = lessResourcesAppFolderWorkspace.filter(appFolderResource => {
        const resourcePath = appFolderResource.getPath();
        return lessToCompile.some(excludePattern => resourcePath.includes(excludePattern) || minimatch(resourcePath.slice(1), excludePattern))
    });

    const lessResources = lessResourcesAppFolderWorkspace.map(appFolderResource => {
        const lessResourceProjectWorkspace = lessResourcesProjectWorkspace.find(projectResource => projectResource.getPath().includes(appFolderResource.getPath()));
        return {
            projectResourcePath: lessResourceProjectWorkspace.getPath(),
            resource: appFolderResource
        };
    });

    const compiledResources = await compileLess(lessResources, fsInterface(customCombo), isDebug);

    return Promise.all(
        compiledResources.map(resource => {
            isDebug && log.info(`Writing file ${resource.getPath()}...`);
            return workspace.write(resource);
        })
    );
};

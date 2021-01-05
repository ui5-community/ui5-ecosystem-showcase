const path = require("path");
const yazl = require("yazl");
const resourceFactory = require("@ui5/fs").resourceFactory;
const log = require("@ui5/logger").getLogger("builder:customtask:zipper");

/**
 * Zips the application content of the output folder
 *
 * @param {Object} parameters Parameters
 * @param {DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {Object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} parameters.options.projectNamespace Project namespace
 * @param {string} [parameters.options.archiveName] ZIP archive name (defaults to project namespace)
 * @param {string} [parameters.options.additionalFiles] List of additional files to be included
 * @returns {Promise<undefined>} Promise resolving with undefined once data has been written
 */
module.exports = async function ({ workspace, dependencies, options, taskUtil }) {
  const { OmitFromBuildResult } = taskUtil.STANDARD_TAGS;

  // debug mode?
  const isDebug = options && options.configuration && options.configuration.debug;

  // determine the name of the ZIP archive (either from config or from project namespace)
  const defaultName = options && options.configuration && options.configuration.archiveName;
  const keepResources = options && options.configuration && options.configuration.keepResources;
  const zipName = `${defaultName || options.projectNamespace.replace(/\//g, '')}.zip`;

  // retrieve the resource path prefix (to get all application resources)
  const prefixPath = `/resources/${options.projectNamespace}/`;

  // get all application related resources
  let allResources;
  try {
    const ws = await workspace.byGlob(`${prefixPath}/**`);
    const dep = await dependencies.byGlob(`**`);
    allResources = [...ws, ...dep];
  } catch (e) {
    log.error(`Couldn't read resources: ${e}`);
  }

  // create the ZIP archive and add the resources
  const zip = new yazl.ZipFile();
  try {
    // include the application related resources
    await Promise.all(allResources.map((resource) => {
      if (!keepResources) {
        taskUtil.setTag(resource, OmitFromBuildResult, true);
      }
      return resource.getBuffer().then((buffer) => {
        isDebug && log.info(`Adding ${resource.getPath()} to archive.`);
        zip.addBuffer(buffer, resource.getPath().replace(prefixPath, '').replace("/resources", 'resources').replace("/test-resources", 'test-resources'));
      })
    }));
    // include the additional files from the project
    const additionalFiles = options && options.configuration && options.configuration.additionalFiles;
    if (Array.isArray(additionalFiles) && additionalFiles.length > 0) {
      await Promise.all(additionalFiles.map((fileName) => {
        isDebug && log.info(`Adding ${fileName} to archive.`);
        zip.addFile(path.join(process.cwd(), fileName), fileName);
      }));
    }
  } catch (e) {
    log.error(`Couldn't add all resources to the archive: ${e}`);
    throw e;
  } finally {
    zip.end();
  }

  const res = resourceFactory.createResource({
    path: `/${zipName}`,
    stream: zip.outputStream
  });

  return workspace.write(res).then(() => { log.verbose(`Created ${zipName} file.`); });

};

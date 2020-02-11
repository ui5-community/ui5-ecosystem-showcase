
const yazl = require("yazl");
const resourceFactory = require("@ui5/fs").resourceFactory;
const log = require("@ui5/logger").getLogger("builder:customtask:zipper");

module.exports = async function ({ workspace, dependencies, options }) {

    const zipName = `${options.configuration.archiveName || options.projectNamespace.replace(/\//g, '')}.zip`;
    const prefixPath = `/resources/${options.projectNamespace}/`
    let allResources;
    try {
        allResources = await workspace.byGlob(`${prefixPath}/**`);
    } catch (e) {
        log.error(`Couldn't read resources: ${e}`);
    }

    const zip = new yazl.ZipFile();
    try {
        await Promise.all(allResources.map((resource) =>
            resource.getBuffer()
                .then((buffer) => {
                    options.configuration && options.configuration.debug && log.info(`Adding ${resource.getPath()} to archive.`);
                    zip.addBuffer(buffer, resource.getPath().replace(prefixPath, ''));
                })
        ));
    } catch (e) {
        log.error(`Couldn't add all resources to the archive: ${e}`);
        throw e;
    } finally {
        zip.end();
    }

    // Blocked: Add an option to output only the zip.
    // Wait for https://github.com/SAP/ui5-fs/issues/155

    const res = resourceFactory.createResource({
        path: `/${zipName}`,
        stream: zip.outputStream
    });

    try {
        await workspace.write(res);
        log.verbose(`Created ${zipName} file.`);
    } catch (e) {
        log.error(`Couldn't write archive to destination: ${e}`);
    }

};
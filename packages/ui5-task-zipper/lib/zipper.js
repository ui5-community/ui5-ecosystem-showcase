
const yazl = require("yazl");
const resourceFactory = require("@ui5/fs").resourceFactory;
const log = require("@ui5/logger").getLogger("builder:customtask:zipper");

module.exports = async function ({ workspace, dependencies, options }) {

    const zipName = `${options.configuration.archiveName || options.projectNamespace.replace(/\//g, '')}.zip`;
    const prefixPath = `/resources/${options.projectNamespace}/`
    const allResources = await workspace.byGlob(`${prefixPath}/**`);

    const zip = new yazl.ZipFile();
    await Promise.all(allResources.map((resource) =>
        resource.getBuffer().then((buffer) => {
            options.configuration && options.configuration.debug && log.info("Transpiling file " + resource.getPath());
            zip.addBuffer(buffer, resource.getPath().replace(prefixPath, ''));
        })
    ));
    zip.end();

     // Blocked: Add an option to output only the zip.
     // Wait for https://github.com/SAP/ui5-fs/issues/155

    const res = resourceFactory.createResource({
        path: `/${zipName}`,
        stream: zip.outputStream
    });

    await workspace.write(res);
    log.verbose(`Created ${zipName} file.`);
};
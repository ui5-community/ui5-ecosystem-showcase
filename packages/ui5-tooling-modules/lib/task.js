const log = require("@ui5/logger").getLogger("builder:customtask:ui5-tooling-modules");
const resourceFactory = require("@ui5/fs").resourceFactory;

const { getResource } = require("./util");

const { readFileSync } = require("fs");
const espree = require('espree');
const estraverse = require('estraverse');
const { XMLParser } = require("fast-xml-parser");


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

    // do not run the task for root projects!
    if (!taskUtil.isRootProject()) {
        log.info(`Skipping execution. Current project '${options.projectName}' is not the root project.`);
        return;
    }

    // collector for unique dependencies and resources
    const uniqueDeps = new Set();
    const uniqueResources = new Set();

    // utility to lookup unique JS dependencies
    function findUniqueJSDeps(content) {
        // use espree to parse the UI5 modules and extract the UI5 module dependencies
        const program = espree.parse(content, { range: true, comment: true, tokens: true, ecmaVersion: "latest" });
        estraverse.traverse(program, {
            enter(node, parent) {
                if (/* sap.ui.require.toUrl */
                    node?.type === "CallExpression" &&
                    node?.callee?.property?.name == "toUrl" &&
                    node?.callee?.object?.property?.name == "require" &&
                    node?.callee?.object?.object?.property?.name == "ui" &&
                    node?.callee?.object?.object?.object?.name == "sap") {
                    const elDep = node.arguments[0];
                    if (elDep?.type === "Literal") {
                        uniqueResources.add(elDep.value);
                    }
                } else if (/* sap.ui.(require|define) */
                    node?.type === "CallExpression" &&
                    /require|define/.test(node?.callee?.property?.name) &&
                    node?.callee?.object?.property?.name == "ui" &&
                    node?.callee?.object?.object?.name == "sap") {
                    const depsArray = node.arguments.filter(arg => arg.type === "ArrayExpression");
                    if (depsArray.length > 0) {
                        const deps = depsArray[0].elements.filter(el => el.type === "Literal").map(el => el.value);
                        deps.forEach(dep => {
                            uniqueDeps.add(dep);
                            // each dependency which can be resolved via the NPM package name
                            // should also be checked for its dependencies to finally handle them
                            // here if they also require to be transpiled by the task
                            try {
                                const depPath = require.resolve(dep);
                                const depContent = readFileSync(depPath, {encoding: "utf8"});
                                findUniqueJSDeps(depContent);
                            } catch (err) {}
                        });
                    }
                }
            }
        });
    }

    // utility to lookup unique XML dependencies
    function findUniqueXMLDeps(node, ns = {}) {
        if (node) {
            // attributes
            Object.keys(node).filter(key => key.startsWith("@_")).forEach(key => {
                const nsParts = /@_xmlns(?::(.*))?/.exec(key);
                if (nsParts) {
                    // namespace (default namespace => "")
                    ns[nsParts[1] || ""] = node[key];
                }
            });
            // nodes
            Object.keys(node).filter(key => !key.startsWith("@_")).forEach(key => {
                const children = Array.isArray(node[key]) ? node[key] : [node[key]];
                children.forEach(child => {
                    const nodeParts = /(?:([^:]*):)?(.*)/.exec(key);
                    if (nodeParts) {
                        // only add those dependencies whose namespace is known
                        let namespace = ns[nodeParts[1] || ""];
                        if (namespace) {
                            namespace = namespace.replaceAll(/\./g, "/");
                            const dep = `${namespace}/${nodeParts[2]}`;
                            uniqueDeps.add(dep);
                            // each dependency which can be resolved via the NPM package name
                            // should also be checked for its dependencies to finally handle them
                            // here if they also require to be transpiled by the task
                            try {
                                const depPath = require.resolve(dep);
                                const depContent = readFileSync(depPath, {encoding: "utf8"});
                                findUniqueJSDeps(depContent);
                            } catch (err) {}
                        }
                        findUniqueXMLDeps(child, ns);
                    }
                });
            });
        }
    }


    // find all XML resources to determine their dependencies
    const allXMLWorkspaceResources = await workspace.byGlob("/**/*.xml");

    // lookup all resources for their dependencies via the above utility
    if (allXMLWorkspaceResources.length > 0) {

        const parser = new XMLParser({
            attributeNamePrefix : "@_",
            ignoreAttributes : false,
            ignoreNameSpace: false,
        });

        await Promise.all(allXMLWorkspaceResources.map(async (resource) => {
            log.verbose(`Processing XML resource: ${resource.getPath()}`);

            const content = await resource.getString();
            const xmldom = parser.parse(content);
            findUniqueXMLDeps(xmldom);

            return resource;
        }));

    }

    // find all JS resources to determine their dependencies
    const allWorkspaceResources = await workspace.byGlob("/**/*.js");
    const allDependenciesResources = await dependencies.byGlob("/**/*.js");
    const allResources = [...allWorkspaceResources, ...allDependenciesResources];

    // lookup all resources for their dependencies via the above utility
    await Promise.all(allResources.map(async (resource) => {
        log.verbose(`Processing JS resource: ${resource.getPath()}`);

        const content = await resource.getString();
        findUniqueJSDeps(content);

        return resource;
    }));

    // every unique dependency will be tried to be transpiled
    await Promise.all(Array.from(uniqueDeps).map(async (dep) => {

        log.verbose(`Trying to process dependency: ${dep}`);
        const bundle = await getResource(dep);
        if (bundle) {
            log.info(`Processing dependency: ${dep}`);
            const bundleResource = resourceFactory.createResource({
                path: `/resources/${dep}.js`,
                string: bundle
            });
            await workspace.write(bundleResource);
        }

    }));

    // every unique resource will be copied
    await Promise.all(Array.from(uniqueResources).map(async (resource) => {

        log.verbose(`Trying to process resource: ${resource}`);
        const content = await getResource(resource);
        if (content) {
            log.info(`Processing resource: ${resource}`);
            const newResource = resourceFactory.createResource({
                path: `/resources/${resource}`,
                string: content
            });
            await workspace.write(newResource);
        }

    }));

};

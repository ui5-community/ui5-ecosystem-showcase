const log = require("@ui5/logger").getLogger("builder:customtask:ui5-tooling-modules");
const resourceFactory = require("@ui5/fs").resourceFactory;

const { generateBundle } = require("./util");

const { readFileSync } = require("fs");
const espree = require('espree');
const estraverse = require('estraverse');


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

    // find all JS resources to determine their dependencies
    const allWorkspaceResources = await workspace.byGlob("/**/*.js");
    const allDependenciesResources = await dependencies.byGlob("/**/*.js");
    const allResources = [...allWorkspaceResources, ...allDependenciesResources];

    // utility to lookup unique dependencies
    const uniqueDeps = new Set();
    function findUniqueDeps(content) {
        // use espree to parse the UI5 modules and extract the UI5 module dependencies
        const program = espree.parse(content, { range: true, comment: true, tokens: true, ecmaVersion: "latest" });
        estraverse.traverse(program, {
            enter(node, parent) {
                if (node?.type === "CallExpression" &&
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
                                const depConent = readFileSync(depPath, {encoding: "utf8"});
                                findUniqueDeps(depConent);
                            } catch (err) {}
                        });
                    }
                }
            }
        });
    }

    // lookup all resources for their dependencies via the above utility
    await Promise.all(allResources.map(async (resource) => {
        log.verbose(`Processing: ${resource.getPath()}`);

        const content = await resource.getString();
        findUniqueDeps(content);

        return resource;
    }));

    // every unique dependency will be tried to be transpiled
    await Promise.all(Array.from(uniqueDeps).map(async (dep) => {

        log.verbose(`Trying to bundle dependency: ${dep}`);
        const bundle = await generateBundle(dep);
        if (bundle) {
            log.info(`Bundle dependency: ${dep}`);
            const bundleResource = resourceFactory.createResource({
                path: `/resources/${dep}.js`,
                string: bundle
            });
            await workspace.write(bundleResource);
        }

    }));

};

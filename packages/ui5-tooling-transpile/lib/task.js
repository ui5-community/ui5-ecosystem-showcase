const log = require("@ui5/logger").getLogger("builder:customtask:ui5-tooling-transpile");
const resourceFactory = require("@ui5/fs").resourceFactory;

const { generateBundle } = require("./util");

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

    if (!taskUtil.isRootProject()) {
        log.info(`Skipping execution. Current project '${options.projectName}' is not the root project.`);
        return;
    }

    const allWorkspaceResources = await workspace.byGlob("/**/*.js");
    const allDependenciesResources = await dependencies.byGlob("/**/*.js");
    const allResources = [...allWorkspaceResources, ...allDependenciesResources];

    const uniqueDeps = new Set();

    await Promise.all(allResources.map(async (resource) => {
        log.verbose(`Processing: ${resource.getPath()}`);

        const content = await resource.getString();
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
                        deps.forEach(dep => uniqueDeps.add(dep));
                    }
                }
            }
        });

        return resource;

    }));

    const bundleCache = {};
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

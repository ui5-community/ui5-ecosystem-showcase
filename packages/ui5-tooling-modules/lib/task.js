/* eslint-disable no-unused-vars, no-empty */
const path = require("path");
const { createReadStream } = require("fs");
const espree = require("espree");
const estraverse = require("estraverse");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");
const minimatch = require("minimatch");

/**
 * Custom task to create the UI5 AMD-like bundles for used ES imports from node_modules.
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/logger/Logger} parameters.log Logger instance
 * @param {module:@ui5/fs/DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {object} parameters.taskUtil Specification Version dependent interface to a
 *                [TaskUtil]{@link module:@ui5/builder.tasks.TaskUtil} instance
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.projectNamespace] Project namespace if available
 * @param {object} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @param {boolean} [parameters.options.configuration.prependPathMappings] Prepend the path mappings for the UI5 loader to Component.js
 * @param {boolean} [parameters.options.configuration.addToNamespace] Adds modules into the sub-namespace thirdparty of the Component
 * @param {boolean} [parameters.options.configuration.removeScopePrefix] Remove the @ prefix for the scope in the namespace/path
 * @param {boolean} [parameters.options.configuration.providedDependencies] List of provided dependencies which should not be processed
 * @param {object<string, string[]>} [parameters.options.configuration.includeAssets] Map of assets (key: npm package name, value: local paths) to be included (embedded)
 * @param {boolean|string[]} [parameters.options.configuration.keepDynamicImports] List of NPM packages for which the dynamic imports should be kept or boolean (defaults to true)
 * @param {boolean|string[]} [parameters.options.configuration.skipTransform] flag or array of globs to verify whether the module transformation should be skipped
 * @param {boolean} [parameters.options.configuration.minify] minify the generated code
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
module.exports = async function ({ log, workspace, taskUtil, options }) {
	const cwd = taskUtil.getProject().getRootPath() || process.cwd();
	const { scan, getBundleInfo, getResource, existsResource } = require("./util")(log);

	// determine all paths for the dependencies
	const depPaths = taskUtil
		.getDependencies()
		.map((dep) => taskUtil.getProject(dep))
		.filter((prj) => !prj.isFrameworkProject())
		.map((prj) => prj.getRootPath());

	// derive the configuration and default values
	const config = Object.assign(
		{
			debug: false,
			skipTransform: false,
		},
		options.configuration
	);

	// scan the content of the project for unique dependencies, resources and more
	const { uniqueModules, uniqueResources, uniqueNS } = await scan(workspace, config, { cwd, depPaths });

	// list of included assets pattern (required for rewrite)
	const includedAssets = [];
	if (config.includeAssets) {
		Object.keys(config.includeAssets).forEach((npmPackageName) => {
			const localPaths = config.includeAssets[npmPackageName];
			if (Array.isArray(localPaths)) {
				includedAssets.push(...localPaths.map((localPath) => path.join(npmPackageName, localPath)));
			} else {
				includedAssets.push(`${npmPackageName}/**`);
			}
		});
	}
	// eslint-disable-next-line jsdoc/require-jsdoc
	function isAssetIncluded(path) {
		return includedAssets.some((value) => {
			return minimatch(path, value);
		});
	}

	// utility to rewrite dependency
	const removeScopePrefix = config?.removeScopePrefix || config?.removeScopePreceder;
	// eslint-disable-next-line jsdoc/require-jsdoc
	function rewriteDep(dep, bundledResources, useDottedNamespace) {
		const aDep = dep.replaceAll(/\.?\.\//g, "");
		if (config.addToNamespace && (bundledResources.indexOf(aDep) !== -1 || uniqueResources.has(aDep) || uniqueNS.has(aDep) || isAssetIncluded(aDep))) {
			let d = aDep;
			if (removeScopePrefix && d.startsWith("@")) {
				d = d.substring(1);
			}
			d = `${options.projectNamespace}/thirdparty/${d}`;
			return useDottedNamespace ? d.replace(/\//g, ".") : d;
		} else {
			return dep;
		}
	}

	// utility to rewrite JS dependencies
	// eslint-disable-next-line jsdoc/require-jsdoc
	function rewriteJSDeps(content, bundledResources, resourcePath) {
		let changed = false;
		try {
			const program = espree.parse(content, { range: true, comment: true, tokens: true, ecmaVersion: "latest" });
			const tokens = {};
			estraverse.traverse(program, {
				enter(node, parent) {
					if (
						/* sap.ui.require.toUrl */
						node?.type === "CallExpression" &&
						node?.callee?.property?.name == "toUrl" &&
						node?.callee?.object?.property?.name == "require" &&
						node?.callee?.object?.object?.property?.name == "ui" &&
						node?.callee?.object?.object?.object?.name == "sap"
					) {
						const elDep = node.arguments[0];
						if (elDep?.type === "Literal" /* && (bundledResources.includes(elDep.value) || isAssetIncluded(elDep.value)) */) {
							tokens[elDep.value] = rewriteDep(elDep.value, bundledResources);
							elDep.value = tokens[elDep.value];
							changed = true;
						}
					} else if (
						/* sap.ui.(requireSync) !LEGACY! */
						(node?.type === "CallExpression" &&
							/requireSync/.test(node?.callee?.property?.name) &&
							node?.callee?.object?.property?.name == "ui" &&
							node?.callee?.object?.object?.name == "sap") ||
						/* __ui5_require_async (babel-plugin-transform-modules-ui5) */
						(node?.type === "CallExpression" && node?.callee?.name == "__ui5_require_async")
					) {
						const elDep = node.arguments[0];
						if (elDep?.type === "Literal" /* && bundledResources.includes(elDep.value) */) {
							tokens[elDep.value] = rewriteDep(elDep.value, bundledResources);
							elDep.value = tokens[elDep.value];
							changed = true;
						}
					} else if (
						/* sap.ui.(require|define) */
						node?.type === "CallExpression" &&
						/require|define/.test(node?.callee?.property?.name) &&
						node?.callee?.object?.property?.name == "ui" &&
						node?.callee?.object?.object?.name == "sap"
					) {
						const depsArray = node.arguments.filter((arg) => arg.type === "ArrayExpression");
						if (depsArray.length > 0) {
							depsArray[0].elements.forEach((elDep) => {
								if (elDep?.type === "Literal" /* && bundledResources.includes(elDep.value) */) {
									tokens[elDep.value] = rewriteDep(elDep.value, bundledResources);
									elDep.value = tokens[elDep.value];
									changed = true;
								}
							});
						}
					}
				},
			});
			if (changed) {
				// escodegen removes the sourcemap and changes the source code formatting
				//changed = escodegen.generate(program, { sourcemap: true });
				// therefore we use regex to keep source formatting and sourcmap entry!
				changed = content;
				Object.keys(tokens).forEach((token) => {
					changed = changed.replace(new RegExp(`(\\([^)]*["'])${token}(["'][^)]*\\))`, "g"), `$1${tokens[token]}$2`);
				});
			} else {
				changed = content;
			}
		} catch (err) {
			log.error(`Failed to rewrite "${resourcePath}"! Ignoring resource... (maybe an ES module you included as asset by mistake?)`);
			config.debug && log.error(err);
		}
		return changed;
	}

	// utility to rewrite XML dependencies
	// eslint-disable-next-line jsdoc/require-jsdoc
	function rewriteXMLDeps(node, bundledResources) {
		let changed = false;
		if (node) {
			// attributes
			Object.keys(node)
				.filter((key) => key.startsWith("@_"))
				.forEach((key) => {
					const nsParts = /@_xmlns(?::(.*))?/.exec(key);
					if (nsParts) {
						// namespace (default namespace => "")
						const namespace = node[key].replace(/\./g, "/");
						if (
							bundledResources.some((res) => {
								return res.startsWith(namespace);
							})
						) {
							node[key] = rewriteDep(node[key], bundledResources, true);
							changed = true;
						}
						return;
					}
					const importsParts = /@_(.*):import?/.exec(key);
					if (importsParts) {
						node[key] = rewriteDep(node[key], bundledResources);
						changed = true;
						return;
					}
				});
			// nodes
			Object.keys(node)
				.filter((key) => !key.startsWith("@_"))
				.forEach((key) => {
					const children = Array.isArray(node[key]) ? node[key] : [node[key]];
					children.forEach((child) => {
						const nodeParts = /(?:([^:]*):)?(.*)/.exec(key);
						if (nodeParts) {
							// skip #text nodes
							let module = nodeParts[2];
							if (module !== "#text") {
								changed = rewriteXMLDeps(child, bundledResources) || changed;
							}
						}
					});
				});
		}
		return changed;
	}

	// bundle the resources (determine bundled resources and the set of modules to build)
	const { resourceFactory } = taskUtil;

	// every unique dependency will be bundled (entry points will be kept, rest is chunked)
	const bundleInfo = await getBundleInfo(Array.from(uniqueModules), config, { cwd, depPaths });
	const bundledResources = bundleInfo.getBundledResources().map((entry) => entry.name);
	await Promise.all(
		bundleInfo.getEntries().map(async (entry) => {
			config.debug && log.info(`Processing ${entry.type}: ${entry.name}`);
			const newResource = resourceFactory.createResource({
				path: `/resources/${rewriteDep(entry.name, bundledResources)}.js`,
				string: rewriteJSDeps(entry.code, bundledResources, entry.name),
			});
			await workspace.write(newResource);
		})
	);

	// every unique resource will be copied
	await Promise.all(
		Array.from(uniqueResources).map(async (resourceName) => {
			log.verbose(`Trying to process resource: ${resourceName}`);
			if (existsResource(resourceName, { cwd, depPaths, onlyFiles: true })) {
				const resource = getResource(resourceName, { cwd, depPaths });
				config.debug && log.info(`Processing resource: ${resourceName}`);
				const newResource = resourceFactory.createResource({
					path: `/resources/${rewriteDep(resourceName, bundledResources)}`,
					stream: resource.path ? createReadStream(resource.path) : undefined,
					string: !resource.path && resource.code ? resource.code : undefined,
				});
				await workspace.write(newResource);
			}
		})
	);

	// process all XML and JS files in workspace and rewrite the module names
	if (config?.addToNamespace) {
		const parser = new XMLParser({
			attributeNamePrefix: "@_",
			ignoreAttributes: false,
			ignoreNameSpace: false,
			processEntities: false,
			allowBooleanAttributes: false,
			suppressBooleanAttributes: true,
			preserveOrder: true,
		});
		const builder = new XMLBuilder({
			attributeNamePrefix: "@_",
			ignoreAttributes: false,
			ignoreNameSpace: false,
			processEntities: false,
			allowBooleanAttributes: false,
			suppressBooleanAttributes: true,
			preserveOrder: true,
			format: true,
		});

		// check whether the current resource should be skipped or not (based on module name)
		const shouldSkipTransform = function (resourcePath) {
			return Array.isArray(config.skipTransform)
				? config.skipTransform.some((value) => {
						return minimatch(resourcePath, `/resources/${options.projectNamespace}/thirdparty/${value}`);
				  })
				: config.skipTransform;
		};

		const allJsXmlResources = await workspace.byGlob("/**/*.{js,xml}");
		await Promise.all(
			allJsXmlResources.map(async (res) => {
				const resourcePath = res.getPath();
				if (resourcePath.endsWith(".js")) {
					if (!shouldSkipTransform(resourcePath)) {
						const content = await res.getString();
						const newContent = rewriteJSDeps(content, bundledResources, resourcePath);
						if (newContent /* false in case of rewrite issues! */ && newContent != content) {
							config.debug && log.info(`Rewriting JS resource: ${resourcePath}`);
							res.setString(newContent);
							await workspace.write(res);
						}
					} else {
						config.debug && log.info(`Skipping rewriting of resource "${resourcePath}"...`);
					}
				} else if (resourcePath.endsWith(".xml")) {
					const content = await res.getString();
					const xmldom = parser.parse(content);
					if (rewriteXMLDeps(xmldom, bundledResources)) {
						config.debug && log.info(`Rewriting XML resource: ${resourcePath}`);
						const newContent = builder.build(xmldom);
						res.setString(newContent);
						await workspace.write(res);
					}
				}
			})
		);
	}

	// create path mappings for bundled resources in Component.js
	if (!config?.addToNamespace && config?.prependPathMappings) {
		const resComponent = await workspace.byPath(`/resources/${options.projectNamespace}/Component.js`);
		if (resComponent) {
			let pathMappings = "";
			Array.from(bundledResources).map(async (resource) => {
				pathMappings += `"${resource}": sap.ui.require.toUrl("${options.projectNamespace}/resources/${resource}"),`;
			});
			let content = await resComponent.getString();
			content = `sap.ui.loader.config({ paths: { ${pathMappings} }});

${content}`;
			await resComponent.setString(content);
			await workspace.write(resComponent);
		}
	}
};

/**
 * Callback function to define the list of required dependencies
 *
 * @returns {Promise<Set>}
 *      Promise resolving with a Set containing all dependencies
 *      that should be made available to the task.
 *      UI5 Tooling will ensure that those dependencies have been
 *      built before executing the task.
 */
module.exports.determineRequiredDependencies = async function () {
	return new Set(); // dependency resolution uses Nodes' require APIs
};

const path = require("path");
const { createReadStream } = require("fs");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");
const minimatch = require("minimatch");
const parseJS = require("./utils/parseJS");
const sanitize = require("sanitize-filename");

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
 * @param {boolean|string} [parameters.options.configuration.addToNamespace] Adds modules into the sub-namespace thirdparty of the Component
 * @param {boolean} [parameters.options.configuration.removeScopePrefix] Remove the @ prefix for the scope in the namespace/path
 * @param {boolean} [parameters.options.configuration.providedDependencies] List of provided dependencies which should not be processed
 * @param {object<string, string[]>} [parameters.options.configuration.includeAssets] Map of assets (key: npm package name, value: local paths) to be included (embedded)
 * @param {boolean|string[]} [parameters.options.configuration.keepDynamicImports] List of NPM packages for which the dynamic imports should be kept or boolean (defaults to true)
 * @param {boolean|string[]} [parameters.options.configuration.skipTransform] flag or array of globs to verify whether the module transformation should be skipped
 * @param {boolean} [parameters.options.configuration.minify] minify the generated code
 * @param {boolean|string} [parameters.options.configuration.chunksPath] the relative path for the chunks to be stored (defaults to "chunks", if value is true, chunks are put into the closest modules folder)
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
module.exports = async function ({ log, workspace, taskUtil, options }) {
	const { parse } = await import("@typescript-eslint/typescript-estree");
	const { walk } = await import("estree-walker");

	const cwd = taskUtil.getProject().getRootPath() || process.cwd();
	const project = taskUtil.getProject();
	const projectInfo = {
		name: project.getName(),
		version: project.getVersion(),
		namespace: project.getNamespace(),
		type: project.getType(),
		rootPath: project.getRootPath(),
		framework: {
			name: project.getFrameworkName(),
			version: project.getFrameworkVersion(),
		},
	};

	const { scan, getBundleInfo, getResource, existsResource } = require("./util")(log, projectInfo);

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
			addToNamespace: true,
		},
		options.configuration,
	);

	// derive the custom thirdparty namespace
	let thirdpartyNamespace = "thirdparty";
	if (typeof config.addToNamespace === "string") {
		thirdpartyNamespace = config.addToNamespace
			.split(/[\\/]/)
			.map(sanitize)
			.filter((s) => !/^\.*$/.test(s))
			.join("/");
		config.addToNamespace = true;
	}

	// scan the content of the project for unique dependencies, resources and more
	const scanTime = Date.now();
	const { uniqueModules, uniqueResources, uniqueNS } = await scan(workspace, config, { cwd, depPaths });
	config.debug && log.info(`Scanning took ${Date.now() - scanTime} millis`);

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
		// remove the relative path and the project namespace
		const aDep = dep.replaceAll(`${options.projectNamespace}/resources/`, "").replaceAll(/\.?\.\//g, "");
		if (config.addToNamespace && (bundledResources.indexOf(aDep) !== -1 || uniqueResources.has(aDep) || uniqueNS.has(aDep) || isAssetIncluded(aDep))) {
			let d = aDep;
			if (removeScopePrefix && d.startsWith("@")) {
				d = d.substring(1);
			}
			d = `${options.projectNamespace}/${thirdpartyNamespace}/${d}`;
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
			const program = parse(content, { comment: true, loc: true, range: true, tokens: true });
			const tokens = {};
			walk(program, {
				// eslint-disable-next-line no-unused-vars
				enter(node, parent, prop, index) {
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
	function rewriteXMLDeps(node, bundledResources, ns = {}) {
		let changed = false;
		if (node) {
			// attributes
			Object.keys(node)
				.filter((key) => key.startsWith("@_"))
				.forEach((key) => {
					const nsParts = /@_xmlns(?::(.*))?/.exec(key);
					if (nsParts) {
						ns[nsParts[1] || ""] = node[key];
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
					const requireParts = /@_(?:(.*):)?require/.exec(key);
					if (requireParts && ns[requireParts[1]] === "sap.ui.core") {
						try {
							const requires = parseJS(node[key]);
							for (const [key, value] of Object.entries(requires)) {
								requires[key] = rewriteDep(value, bundledResources);
							}
							node[key] = JSON.stringify(requires, null, 2).replace(/"/g, "'");
							// eslint-disable-next-line no-unused-vars
						} catch (err) {
							log.error(`Failed to parse the "${node[key]}" as JS object!`);
						}
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
								changed = rewriteXMLDeps(child, bundledResources, ns) || changed;
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
	const bundleTime = Date.now();
	const bundleInfo = await getBundleInfo(Array.from(uniqueModules), config, { cwd, depPaths });
	if (bundleInfo.error) {
		log.error(bundleInfo.error);
		process.exit(1);
	}
	const bundledResources = bundleInfo.getBundledResources().map((entry) => entry.name);
	await Promise.all(
		bundleInfo.getEntries().map(async (entry) => {
			config.debug && log.info(`Processing ${entry.type}: ${entry.name}`);
			const newResource = resourceFactory.createResource({
				path: `/resources/${rewriteDep(entry.name, bundledResources)}.js`,
				string: rewriteJSDeps(entry.code, bundledResources, entry.name),
			});
			await workspace.write(newResource);
		}),
	);
	config.debug && log.info(`Bundling took ${Date.now() - bundleTime} millis`);

	// every unique resource will be copied
	const copyTime = Date.now();
	await Promise.all(
		Array.from(uniqueResources).map(async (resourceName) => {
			const resourcePath = `/resources/${rewriteDep(resourceName, bundledResources)}`;
			if (!(await workspace.byPath(resourcePath))) {
				log.verbose(`Trying to process resource: ${resourceName}`);
				if (existsResource(resourceName, { cwd, depPaths, onlyFiles: true })) {
					const resource = getResource(resourceName, { cwd, depPaths });
					config.debug && log.info(`Processing resource: ${resourceName}`);
					const newResource = resourceFactory.createResource({
						path: resourcePath,
						stream: resource.path ? createReadStream(resource.path) : undefined,
						string: !resource.path && resource.code ? resource.code : undefined,
					});
					await workspace.write(newResource);
				}
			} else {
				log.verbose(`Skipping copy of existing resource: ${resourceName}`);
			}
		}),
	);
	config.debug && log.info(`Copying resources took ${Date.now() - copyTime} millis`);

	// process all XML and JS files in workspace and rewrite the module names
	if (config?.addToNamespace) {
		const rewriteTime = Date.now();
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
						return minimatch(resourcePath, `/resources/${options.projectNamespace}/${thirdpartyNamespace}/${value}`);
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
			}),
		);
		config.debug && log.info(`Rewriting took ${Date.now() - rewriteTime} millis`);
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

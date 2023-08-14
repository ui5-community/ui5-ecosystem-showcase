/* eslint-disable no-unused-vars, no-empty */
const path = require("path");
const { readFileSync, existsSync } = require("fs");
const espree = require("espree");
const estraverse = require("estraverse");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const escodegen = require("@javascript-obfuscator/escodegen"); // escodegen itself isn't released anymore since 2020 => using fork
const minimatch = require("minimatch");

/**
 * Custom task to create the UI5 AMD-like bundles for used ES imports from node_modules.
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/logger/Logger} parameters.log Logger instance
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {object} parameters.taskUtil Specification Version dependent interface to a
 *                [TaskUtil]{@link module:@ui5/builder.tasks.TaskUtil} instance
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.projectNamespace] Project namespace if available
 * @param {string} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @param {boolean} [parameters.options.configuration.prependPathMappings] Prepend the path mappings for the UI5 loader to Component.js
 * @param {boolean} [parameters.options.configuration.addToNamespace] Adds modules into the sub-namespace thirdparty of the Component
 * @param {boolean} [parameters.options.configuration.removeScopePrefix] Remove the @ prefix for the scope in the namespace/path
 * @param {boolean} [parameters.options.configuration.providedDependencies] List of provided dependencies which should not be processed
 * @param {object<string, string[]>} [parameters.options.configuration.includeAssets] Map of assets (key: npm package name, value: local paths) to be included (embedded)
 * @param {boolean|string[]} [parameters.options.configuration.keepDynamicImports] List of NPM packages for which the dynamic imports should be kept or boolean (defaults to true)
 * @param {boolean|string[]} [parameters.options.configuration.skipTransform] flag or array of globs to verify whether the module transformation should be skipped
 * @returns {Promise<undefined>} Promise resolving with <code>undefined</code> once data has been written
 */
module.exports = async function ({ log, workspace, taskUtil, options }) {
	const { getResource, resolveModule, listResources } = require("./util")(log);

	const config = options.configuration || {};
	const removeScopePrefix = config?.removeScopePrefix || config?.removeScopePreceder;
	const providedDependencies = Array.isArray(config?.providedDependencies) ? config?.providedDependencies : [];

	// extract the configuration of files to be skipped during transformation
	const skipTransform = options?.configuration?.skipTransform || false;

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

	const { resourceFactory } = taskUtil;

	// collector for unique dependencies and resources
	//const uniqueNPMPackages = new Set();
	const uniqueDeps = new Set();
	const uniqueResources = new Set();
	const uniqueNS = new Set();
	const uniqueChunks = new Set();

	// eslint-disable-next-line jsdoc/require-jsdoc
	function isProvided(depOrRes) {
		return providedDependencies.filter((e) => depOrRes === e || depOrRes.startsWith(`${e}/`)).length > 0;
	}

	// eslint-disable-next-line jsdoc/require-jsdoc
	/* TODO: keep functionality commented till needed!
	function addUniqueNPMPackage(npmPackageName) {
		if (!uniqueNPMPackages.has(npmPackageName) && npmPackageName && !npmPackageName.startsWith(".") && resolveModule(`${npmPackageName}/package.json`)) {
			uniqueNPMPackages.add(npmPackageName);
		}
	}
	*/

	// eslint-disable-next-line jsdoc/require-jsdoc
	function addUniqueDep(dep) {
		if (isProvided(dep)) {
			return false;
		} else {
			// add the dependency
			uniqueDeps.add(dep);
			// also add the NPM package name
			const npmPackageName = /((?:@[^/]+\/)?(?:[^/]+)).*/.exec(dep)?.[1];
			//addUniqueNPMPackage(npmPackageName);
			return true;
		}
	}

	// eslint-disable-next-line jsdoc/require-jsdoc
	function addUniqueResource(ns) {
		if (!isProvided(ns)) {
			uniqueResources.add(ns);
		}
	}

	// eslint-disable-next-line jsdoc/require-jsdoc
	function addUniqueNamespace(ns) {
		if (!isProvided(ns)) {
			uniqueNS.add(ns);
		}
	}

	// eslint-disable-next-line jsdoc/require-jsdoc
	function addUniqueChunks(chunk) {
		if (!isProvided(chunk)) {
			uniqueChunks.add(chunk);
		}
	}

	// utility to rewrite dependency
	// eslint-disable-next-line jsdoc/require-jsdoc
	function rewriteDep(dep, useDottedNamespace) {
		if (config.addToNamespace && (uniqueDeps.has(dep) || uniqueResources.has(dep) || uniqueNS.has(dep) || uniqueChunks.has(dep) || isAssetIncluded(dep))) {
			let d = dep;
			if (removeScopePrefix && d.startsWith("@")) {
				d = d.substring(1);
			}
			d = `${options.projectNamespace}/thirdparty/${d}`;
			return useDottedNamespace ? d.replace(/\//g, ".") : d;
		} else {
			return dep;
		}
	}

	// utility to lookup unique JS dependencies
	// eslint-disable-next-line jsdoc/require-jsdoc
	function findUniqueJSDeps(content, parentDepPath) {
		// use espree to parse the UI5 modules and extract the UI5 module dependencies
		try {
			const program = espree.parse(content, { range: true, comment: true, tokens: true, ecmaVersion: "latest" });
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
						if (elDep?.type === "Literal") {
							addUniqueResource(elDep.value);
						}
					} else if (
						/* sap.ui.(require|define) */
						(node?.type === "CallExpression" &&
							/require|define|requireSync/.test(node?.callee?.property?.name) &&
							node?.callee?.object?.property?.name == "ui" &&
							node?.callee?.object?.object?.name == "sap") ||
						/* __ui5_require_async (babel-plugin-transform-modules-ui5) */
						(node?.type === "CallExpression" && node?.callee?.name == "__ui5_require_async")
					) {
						let deps;
						if (/requireSync/.test(node?.callee?.property?.name) || /__ui5_require_async/.test(node?.callee?.name)) {
							const elDep = node.arguments[0];
							if (elDep?.type === "Literal") {
								deps = [elDep.value];
							}
						} else {
							const depsArray = node.arguments.filter((arg) => arg.type === "ArrayExpression");
							deps = depsArray?.[0].elements.filter((el) => el.type === "Literal").map((el) => el.value);
						}
						deps?.forEach((dep) => {
							if (addUniqueDep(dep)) {
								// each dependency which can be resolved via the NPM package name
								// should also be checked for its dependencies to finally handle them
								// here if they also require to be transpiled by the task
								try {
									const depPath = resolveModule(dep);
									if (existsSync(depPath)) {
										const depContent = readFileSync(depPath, { encoding: "utf8" });
										findUniqueJSDeps(depContent, depPath);
									}
								} catch (err) {}
							}
						});
					}
				},
			});
		} catch (err) {
			log.verbose(`Failed to parse dependency "${parentDepPath}" with espree!`, err);
		}
	}

	// utility to rewrite JS dependencies
	// eslint-disable-next-line jsdoc/require-jsdoc
	function rewriteJSDeps(content, bundledResources) {
		let changed = false;
		const program = espree.parse(content, { range: true, comment: true, tokens: true, ecmaVersion: "latest" });
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
					if (elDep?.type === "Literal" && (bundledResources.includes(elDep.value) || isAssetIncluded(elDep.value))) {
						elDep.value = rewriteDep(elDep.value);
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
					if (elDep?.type === "Literal" && bundledResources.includes(elDep.value)) {
						elDep.value = rewriteDep(elDep.value);
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
						depsArray[0].elements
							.filter((el) => el.type === "Literal" && bundledResources.includes(el.value))
							.map((el) => {
								el.value = rewriteDep(el.value);
								changed = true;
							});
					}
				}
			},
		});
		return changed ? escodegen.generate(program) : content;
	}

	// utility to lookup unique XML dependencies
	// eslint-disable-next-line jsdoc/require-jsdoc
	function findUniqueXMLDeps(node, ns = {}) {
		if (typeof node === "object") {
			// attributes
			Object.keys(node)
				.filter((key) => key.startsWith("@_"))
				.forEach((key) => {
					const nsParts = /@_xmlns(?::(.*))?/.exec(key);
					if (nsParts) {
						// namespace (default namespace => "")
						ns[nsParts[1] || ""] = node[key];
					}
				});
			// nodes
			Object.keys(node)
				.filter((key) => !key.startsWith("@_"))
				.forEach((key) => {
					const children = Array.isArray(node[key]) ? node[key] : [node[key]];
					children
						.filter((child) => typeof child === "object")
						.forEach((child) => {
							const nodeParts = /(?:([^:]*):)?(.*)/.exec(key);
							if (nodeParts) {
								// skip #text nodes
								let module = nodeParts[2];
								if (module !== "#text") {
									// only add those dependencies whose namespace is known
									let namespace = ns[nodeParts[1] || ""];
									if (typeof namespace === "string") {
										namespace = namespace.replace(/\./g, "/");
										addUniqueNamespace(namespace);
										const dep = `${namespace}/${module}`;
										if (addUniqueDep(dep)) {
											// each dependency which can be resolved via the NPM package name
											// should also be checked for its dependencies to finally handle them
											// here if they also require to be transpiled by the task
											try {
												const depPath = resolveModule(dep);
												if (existsSync(depPath)) {
													const depContent = readFileSync(depPath, { encoding: "utf8" });
													findUniqueJSDeps(depContent, depPath);
												}
											} catch (ex) {}
										}
									}
									findUniqueXMLDeps(child, ns);
								}
							}
						});
				});
		}
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
							node[key] = rewriteDep(node[key], true);
							changed = true;
						}
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

	// find all XML resources to determine their dependencies
	const allXmlResources = await workspace.byGlob("/**/*.xml");

	// lookup all resources for their dependencies via the above utility
	if (allXmlResources.length > 0) {
		const parser = new XMLParser({
			attributeNamePrefix: "@_",
			ignoreAttributes: false,
			ignoreNameSpace: false,
		});

		await Promise.all(
			allXmlResources.map(async (resource) => {
				log.verbose(`Processing XML resource: ${resource.getPath()}`);

				const content = await resource.getString();
				const xmldom = parser.parse(content);
				findUniqueXMLDeps(xmldom);

				return resource;
			})
		);
	}

	// find all JS resources to determine their dependencies
	const allJsResources = await workspace.byGlob("/**/*.js");

	// lookup all resources for their dependencies via the above utility
	await Promise.all(
		allJsResources.map(async (resource) => {
			log.verbose(`Processing JS resource: ${resource.getPath()}`);

			const content = await resource.getString();
			findUniqueJSDeps(content, resource.getPath());

			return resource;
		})
	);

	// lookup the assets to be included which are configured in the ui5.yaml
	if (config.includeAssets) {
		if (typeof config.includeAssets === "object") {
			Object.keys(config.includeAssets).forEach((npmPackageName) => {
				const ignore = config.includeAssets[npmPackageName];
				if (!ignore || Array.isArray(ignore)) {
					log.verbose(`Including assets for dependency: ${npmPackageName}`);
					try {
						const assets = listResources(npmPackageName, ignore);
						if (log.isLevelEnabled("verbose")) {
							assets.forEach((asset) => log.verbose(`  - ${asset}`));
						}
						assets.forEach((asset) => uniqueResources.add(asset));
					} catch (ex) {
						log.error(`The npm package ${npmPackageName} defined in "includeAssets" not found! Skipping assets...`);
					}
				} else {
					log.error(`The option "includeAssets" must be type of map with the key being a npm package name and optionally values being a list of glob patterns!`);
				}
			});
		} else {
			log.error(`The option "includeAssets" must be type of map with the key being a npm package name!`);
		}
	}

	// determine bundled resources
	const bundledResources = [];

	// every unique dependency will be tried to be transpiled
	await Promise.all(
		Array.from(uniqueDeps).map(async (dep) => {
			log.verbose(`Trying to process dependency: ${dep}`);
			const bundle = await getResource(dep, config, skipTransform);
			if (bundle) {
				config.debug && log.info(`Processing dependency: ${dep}`);
				const bundleResource = resourceFactory.createResource({
					path: `/resources/${rewriteDep(dep)}.js`,
					string: bundle.code,
				});
				bundledResources.push(dep);
				await workspace.write(bundleResource);
				// attach the chunks
				if (bundle.chunks) {
					for await (const chunk of Object.keys(bundle.chunks)) {
						config.debug && log.info(`  + chunk ${chunk}`);
						addUniqueChunks(chunk);
						const chunkResource = resourceFactory.createResource({
							path: `/resources/${rewriteDep(chunk)}.js`,
							string: bundle.chunks[chunk].code,
						});
						bundledResources.push(chunk);
						await workspace.write(chunkResource);
					}
				}
			}
		})
	);

	// every unique resource will be copied
	await Promise.all(
		Array.from(uniqueResources).map(async (resourceName) => {
			log.verbose(`Trying to process resource: ${resourceName}`);
			const resource = await getResource(resourceName, config, true);
			if (resource) {
				config.debug && log.info(`Processing resource: ${resourceName}`);
				const newResource = resourceFactory.createResource({
					path: `/resources/${rewriteDep(resourceName)}`,
					string: resource.code,
				});
				bundledResources.push(resourceName);
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

		const allJsXmlResources = await workspace.byGlob("/**/*.{js,xml}");
		await Promise.all(
			allJsXmlResources.map(async (res) => {
				if (res.getPath().endsWith(".js")) {
					try {
						const content = await res.getString();
						const newContent = rewriteJSDeps(content, bundledResources);
						if (newContent != content) {
							config.debug && log.info(`Rewriting JS resource: ${res.getPath()}`);
							res.setString(newContent);
							await workspace.write(res);
						}
					} catch (err) {
						log.error(`Failed to rewrite "${res.getPath()}" with espree!`, err);
					}
				} else if (res.getPath().endsWith(".xml")) {
					const content = await res.getString();
					const xmldom = parser.parse(content);
					if (rewriteXMLDeps(xmldom, bundledResources)) {
						config.debug && log.info(`Rewriting XML resource: ${res.getPath()}`);
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

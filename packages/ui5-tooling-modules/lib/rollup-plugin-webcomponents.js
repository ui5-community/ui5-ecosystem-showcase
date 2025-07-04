const { join, dirname, extname, posix } = require("path");
const { readFileSync, existsSync } = require("fs");
const { createHash } = require("crypto");

const JSDocSerializer = require("./utils/JSDocSerializer");
const WebComponentRegistryHelper = require("./utils/WebComponentRegistryHelper");
const { lt, gte } = require("semver");
const { compile } = require("handlebars");

const prettier = require("@prettier/sync");

const WebComponentRegistry = require("./utils/WebComponentRegistry");

module.exports = function ({ log, resolveModule, pkgJson, getPackageJson, framework, srcPath, options, $metadata = {} } = {}) {
	// derive the configuration from the provided options
	let { skip, scoping, scopeSuffix, enrichBusyIndicator, force, includeAssets, moduleBasePath, removeScopePrefix, skipJSDoc } = Object.assign(
		{
			skip: false,
			scoping: true,
			enrichBusyIndicator: false,
			force: false,
			includeAssets: false, // experimental (due to race condition!)
			skipJSDoc: true,
		},
		options,
	);

	// TODO: maybe we should derive the minimum version from the applications package.json
	//       instead of the framework version (which might be a different version)
	if (!force && !gte(framework?.version || "0.0.0", "1.120.0")) {
		skip = true;
		log.warn("Skipping Web Components transformation as UI5 version is < 1.120.0");
	} else if (force) {
		// for some local development scenarios, we might want to force the transformation
		// when the framework name and framework version is unknown (e.g. openui5 testsuite)
		log.warn("Forcing Web Components transformation");
	}

	// helper function to create a short hash (to scope the UI5 Web Components)
	const createShortHash = ({ name, version }) => {
		return createHash("shake256", { outputLength: 4 }).update(`${name}@${version}`).digest("hex");
	};
	// by default we use the package.json used to launch the process and fallback to the current working directory
	const ui5WebCScopeSuffix = !!scoping && (scopeSuffix || createShortHash(pkgJson));

	// helper function to load and compile a handlebars template
	const loadAndCompileTemplate = (templatePath) => {
		const templateFile = readFileSync(join(__dirname, templatePath), { encoding: "utf-8" });
		return compile(templateFile);
	};

	// handlebars templates for the Web Components transformation
	const webcTmplFnUI5Package = loadAndCompileTemplate("templates/UI5Package.hbs");
	const webcTmplFnUI5Control = loadAndCompileTemplate("templates/UI5Control.hbs");
	const webcTmplFnWebCPackage = loadAndCompileTemplate("templates/WebCPackage.hbs");

	// handlebars templates for the Web Components monkey patches (load and run them)
	const webcTmplMonkeyPatches = [];
	webcTmplMonkeyPatches.push(loadAndCompileTemplate("templates/monkey_patches/SetProperty.hbs")());
	if (lt(framework?.version || "0.0.0", "1.128.0")) {
		webcTmplMonkeyPatches.push(loadAndCompileTemplate("templates/monkey_patches/RenderAttributeProperties.hbs")());
	}
	if (lt(framework?.version || "0.0.0", "1.133.0")) {
		webcTmplMonkeyPatches.push(loadAndCompileTemplate("templates/monkey_patches/RegisterAllEvents.hbs")());
		webcTmplMonkeyPatches.push(loadAndCompileTemplate("templates/monkey_patches/MapValueState.hbs")());
	}
	// no monkey patch for CustomData in 1.138.0 and later as it is supported natively
	//if (lt(framework?.version || "0.0.0", "1.138.0")) {
	webcTmplMonkeyPatches.push(loadAndCompileTemplate("templates/monkey_patches/CustomData.hbs")());
	//}

	// =========================================================================
	// Helpers to determine the Web Component classes and their metadata
	// =========================================================================

	// helper function to extract the npm package name from a module name
	const getNpmPackageName = (source) => {
		const npmPackageScopeRegEx = /^((?:(@[^/]+)\/)?([^/]+))(?:\/(.*))?$/;
		return npmPackageScopeRegEx.exec(source)?.[1];
	};

	// helper function to load a NPM package and its custom elements metadata
	const loadedNpmPackages = [];
	const emittedNpmPackages = [];
	const loadNpmPackage = (npmPackage, emitFile) => {
		let registryEntry = WebComponentRegistry.getPackage(npmPackage);
		if (!registryEntry && !loadedNpmPackages.includes(npmPackage)) {
			loadedNpmPackages.push(npmPackage);
			// retrieve the package.json of the npm package
			const packageJsonPath = resolveModule(`${npmPackage}/package.json`);
			if (packageJsonPath) {
				let packageJson;
				try {
					packageJson = getPackageJson(packageJsonPath);
				} catch (err) {
					log.error(`Failed to parse package.json of ${npmPackage}`, err);
					return undefined;
				}
				const npmPackagePath = dirname(packageJsonPath);
				// check if the custom elements metadata file exists (fallback to custom-elements-internal.json for @ui5/webcomponents)
				let metadataPath;
				if (packageJson.customElements) {
					const customElementsInternalPath = join(npmPackagePath, packageJson.customElements.replace("custom-elements.json", "custom-elements-internal.json"));
					const customElementsPath = join(npmPackagePath, packageJson.customElements);
					if (existsSync(customElementsInternalPath)) {
						metadataPath = customElementsInternalPath;
					} else if (existsSync(customElementsPath)) {
						metadataPath = customElementsPath;
					}
				} else {
					const customElementsInternalPath = join(npmPackagePath, "dist/custom-elements-internal.json");
					const customElementsPath = join(npmPackagePath, "dist/custom-elements.json");
					if (existsSync(customElementsInternalPath)) {
						metadataPath = customElementsInternalPath;
						log.warn(`The package.json of ${npmPackage} does not contain a "customElements" field. Using found "dist/custom-elements-internal.json"`);
					} else if (existsSync(customElementsPath)) {
						metadataPath = customElementsPath;
						log.warn(`The package.json of ${npmPackage} does not contain a "customElements" field. Using found "dist/custom-elements.json"`);
					}
				}
				// load the dependent Web Component packages
				const libraryDependencies = [];
				[...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.optionalDependencies || {})].forEach((dep) => {
					// console.log(`‼️ Load of npm package ${dep} as dependency of ${npmPackage}`);
					const package = loadNpmPackage(dep, emitFile);
					if (package) {
						libraryDependencies.push(package.namespace);
					}
				});

				// load custom elements metadata
				if (metadataPath) {
					const customElementsMetadata = JSON.parse(readFileSync(metadataPath, { encoding: "utf-8" }));

					// console.log(`‼️ WebComponentRegistry.register will be called for ${npmPackage}`);
					// first time registering a new Web Component package
					registryEntry = WebComponentRegistry.register({
						customElementsMetadata,
						namespace: npmPackage,
						moduleBasePath,
						removeScopePrefix,
						scopeSuffix: ui5WebCScopeSuffix,
						npmPackagePath,
						srcPath,
						version: packageJson.version,
					});
					// console.log(`‼️ WebComponentRegistry.register call for ${npmPackage} finished in rollup`);

					// assign the dependencies
					registryEntry.dependencies = libraryDependencies;
				}
			}
		}
		if (!skip && registryEntry && !emittedNpmPackages.includes(npmPackage)) {
			// tell rollup to create a chunk for the Web Components npm package
			emitFile({
				type: "chunk",
				id: registryEntry.namespace,
			});
			emittedNpmPackages.push(npmPackage);
		}
		return registryEntry;
	};

	// helper function to lookup a Web Component class by its module name
	const lookupWebComponentsClass = (source, emitFile) => {
		// determine npm package
		const npmPackage = getNpmPackageName(source);

		let clazz;
		if (npmPackage !== "@ui5/webcomponents-base" && (clazz = WebComponentRegistry.getClassDefinition(source))) {
			return clazz;
		}
		// console.log(`‼️ Initial load of npm package ${npmPackage}`);
		const registryEntry = loadNpmPackage(npmPackage, emitFile);
		if (registryEntry) {
			const metadata = registryEntry;
			let modulePath = resolveModule(source);
			if (modulePath) {
				modulePath = modulePath.substr(metadata.npmPackagePath.length + 1);
				modulePath = modulePath.replace(/\\/g, "/");
				const moduleName = `${npmPackage}/${modulePath}`;
				const clazz = WebComponentRegistry.getClassDefinition(moduleName);
				// TODO: base classes must be ignored as UI5Element is flagged as custom element although it is a base class
				if (clazz && clazz.customElement && npmPackage !== "@ui5/webcomponents-base") {
					return clazz;
				}
			}
		}
	};

	// =========================================================================
	// Helpers for the generation of the UI5 assets (packages and controls)
	// =========================================================================

	const emittedPackages = [];
	const buildPackage = ({ source, package, chunkName }, emitFile) => {
		if (emittedPackages.includes(source)) {
			return;
		}

		const { namespace, version } = package;
		const rootPath = `${posix.relative(dirname(source), "") || "."}/`;

		// compile the library metadata
		const metadataObject = {
			name: namespace,
			version,
			dependencies: ["sap.ui.core"],
			types: Object.keys(package.enums).map((enumName) => package.enums[enumName]._ui5QualifiedName),
			interfaces: Object.keys(package.interfaces).map((interfaceName) => package.interfaces[interfaceName]._ui5QualifiedName),
			controls: Object.keys(package.customElements).map((elementName) => package.customElements[elementName]._ui5QualifiedName),
			elements: [
				/* do we have any? */
			],
			rootPath: `${posix.relative(dirname(source), "") || "."}/`,
		};
		const metadata = JSON.stringify(metadataObject, undefined, 2);

		// is it the base library? (important for the monkey patches)
		const isBaseLib = namespace === "@ui5/webcomponents-base";

		// generate the library code
		const webcPackage = chunkName && posix.relative(dirname(source), chunkName);
		const code = webcTmplFnUI5Package({
			isBaseLib,
			metadata,
			namespace,
			interfaces: package.interfaces,
			hasEnums: Object.keys(package.enums).length > 0,
			enums: package.enums,
			dependencies: package.dependencies?.map((dep) => `${rootPath}${dep}`),
			monkeyPatches: isBaseLib ? webcTmplMonkeyPatches.join("\n") : "",
			webcPackage,
		});

		emitFile({
			type: "prebuilt-chunk",
			id: source,
			fileName: `${source}.js`,
			code: prettier.format(code, { semi: false, parser: "babel" }),
		});

		// store the metadata
		$metadata.packages = $metadata.packages || {};
		$metadata.packages[source] = {
			name: package.namespace,
			qualifiedName: package.qualifiedNamespace,
		};

		// mark the source as emitted
		emittedPackages.push(source);
	};

	const emittedWrappers = [];
	const buildWrapper = ({ source, clazz, chunkName }, emitFile) => {
		const resolvedSource = `${clazz.package}/${clazz.module.slice(0, -3)}`;

		// we always create the original Web Component class which is found in the
		// respective package (e.g. @ui5/webcomponents-base/dist/ComboBox)
		if (!emittedWrappers.includes(resolvedSource)) {
			log.verbose(`Emitting Web Component wrapper: ${resolvedSource}`);

			// determine whether the clazz is based on the UI5Element superclass
			const isClazzUI5Element = WebComponentRegistryHelper.isUI5ElementSubclass(clazz);
			if (ui5WebCScopeSuffix && !isClazzUI5Element) {
				log.warn(`The Web Component "${source}" doesn't support scoping as it is not extending UI5Element!`);
			}
			// Extend the superclass with the WebComponent class and export it
			const ui5Metadata = clazz._ui5metadata;
			const ui5ClassName = clazz._ui5QualifiedName;
			const namespace = ui5Metadata.namespace;
			//const qualifiedNamespace = ui5Metadata.qualifiedNamespace;

			let metadata;
			if (skipJSDoc) {
				const metadataObject = Object.assign({}, ui5Metadata, {
					tag: ui5Metadata.tag,
					//library: `${qualifiedNamespace}.library`, // if not defined, the library is derived from the namespace
					designtime: `${namespace}/designtime/${clazz.name}.designtime`, // add a default designtime
				});
				metadata = JSON.stringify(metadataObject, undefined, 2);
			} else {
				metadata = JSDocSerializer.serializeMetadata(clazz);
			}

			const webcClass = chunkName && posix.relative(dirname(resolvedSource), chunkName);

			// UI5 specific features
			const needsLabelEnablement = clazz._ui5specifics.needsLabelEnablement;
			const needsEnabledPropagator = clazz._ui5specifics.needsEnabledPropagator;
			const needsMessageMixin = clazz._ui5specifics.needsMessageMixin;

			// Determine the superclass UI5 module name and import it
			let webcBaseClass = "sap/ui/core/webc/WebComponent";
			const ui5Superclass = clazz.superclass;
			if (ui5Superclass?._ui5metadata && !WebComponentRegistryHelper.isUI5Element(ui5Superclass)) {
				const { module } = clazz.superclass;
				const { namespace } = clazz.superclass._ui5metadata;
				webcBaseClass = `${namespace}/${module.slice(0, -3)}`;
				if (!emittedWrappers.includes(webcBaseClass)) {
					buildWrapper(
						{
							source: webcBaseClass,
							clazz: clazz.superclass,
						},
						emitFile,
					);
				}
			}

			// JSDoc Serialization for the class header
			const jsDocClassHeader = skipJSDoc ? undefined : clazz._jsDoc?.classHeader;

			// generate the WebComponentControl code
			const rootPath = `${posix.relative(dirname(resolvedSource), "") || "."}/`;
			const code = webcTmplFnUI5Control({
				ui5ClassName: ui5ClassName,
				jsDocClassHeader,
				namespace: `${rootPath}${namespace}`,
				metadata,
				webcClass,
				webcBaseClass: webcBaseClass !== "sap/ui/core/webc/WebComponent" ? `${rootPath}${webcBaseClass}` : webcBaseClass,
				needsLabelEnablement,
				needsEnabledPropagator,
				needsMessageMixin,
				importWebCModule: !!webcClass,
			});

			emitFile({
				type: "prebuilt-chunk",
				id: resolvedSource,
				fileName: `${resolvedSource}.js`,
				code: prettier.format(code, { semi: false, parser: "babel" }),
			});

			// store the metadata
			$metadata.controls = $metadata.controls || {};
			$metadata.controls[resolvedSource] = {
				name: clazz._ui5QualifiedNameSlashes,
				qualifiedName: clazz._ui5QualifiedName,
			};

			// mark the source as emitted
			emittedWrappers.push(resolvedSource);
		}

		// construct a substitute for the Web Component if the source is not the resolved source
		if (resolvedSource !== source && !emittedWrappers.includes(source)) {
			log.verbose(`Emitting Web Component wrapper substitute: ${source}`);
			const rootPath = `${posix.relative(dirname(source), "") || "."}/`;
			emitFile({
				type: "prebuilt-chunk",
				id: source,
				fileName: `${source}.js`,
				code: `/*!\n * \${copyright}\n */\nsap.ui.define(["${rootPath}${resolvedSource}"], function(mod) { return mod; });`,
			});
			// store the metadata
			$metadata.substitutes = $metadata.substitutes || {};
			$metadata.substitutes[source] = {
				name: clazz._ui5QualifiedNameSlashes,
				qualifiedName: clazz._ui5QualifiedName,
			};
			// mark the substitute as emitted
			emittedWrappers.push(source);
			// log a warning that a substitute is used
			log.warn(`Module "${source}" is a substitute! Please use "${resolvedSource}" instead to avoid additional modules!`);
		}
	};

	// =========================================================================
	// Rollup Plugin
	// =========================================================================

	return {
		name: "webcomponents",
		async buildStart() {
			if (skip) {
				return null;
			}

			// clear the registry to ensure that the Web Components are reloaded
			WebComponentRegistry.clear();
		},
		async resolveId(source, importer, { /*attributes, custom,*/ isEntry }) {
			if (skip) {
				return null;
			}

			// entry modules need to be checked for being Web Components as they
			// need to be handled by this plugin to generate the package code
			// and to add a dependency to the package code to ensure that features
			// like scoping, busy indicator enrichment and assets are included
			if (isEntry) {
				let clazz;
				if ((clazz = lookupWebComponentsClass(source, this.emitFile))) {
					const modulePath = `${clazz.package}/${clazz.module}`;
					const absModulePath = resolveModule(modulePath);
					// we need to add the different sources to the Web Component metadata
					// as the same Web Component can have different entry points!
					const moduleInfo = this.getModuleInfo(absModulePath);
					const ui5 = Object.assign(
						{
							sources: [],
							type: "webcomponent",
							clazz,
							modulePath,
							absModulePath,
						},
						moduleInfo?.meta?.ui5,
					);
					if (!ui5.sources.includes(source)) {
						ui5.sources.push(source);
					}
					// resolve the module to the absolute path
					return {
						id: absModulePath,
						meta: {
							ui5,
						},
					};
				}
			}

			// check if the module is a Web Component package to ensure that
			// the package code is generated and included in the build
			let package;
			if ((package = WebComponentRegistry.getPackage(source))) {
				return {
					id: source,
					meta: {
						ui5: {
							source,
							type: "package",
							package,
						},
					},
				};
			}
		},

		async load(id) {
			if (skip) {
				return null;
			}

			// check if the module should be covered by the plugin
			const moduleInfo = this.getModuleInfo(id);
			const ui5Meta = moduleInfo?.meta?.ui5;

			// generate the code for Web Components and their packages
			if (ui5Meta?.type === "webcomponent") {
				// prepend the import of the package to ensure that the package code is included
				const { clazz, absModulePath } = ui5Meta;
				const code = readFileSync(absModulePath, "utf-8");
				return `import "${clazz.package}";\n${code}`;
			} else if (ui5Meta?.type === "package") {
				// generate the web component package code for the UI5 Web Components
				const { namespace, customElements } = ui5Meta.package;

				// create the list of custom elements tags which need to be registered
				let nonUI5TagsToRegister;
				if (ui5WebCScopeSuffix) {
					nonUI5TagsToRegister = Object.values(customElements)
						.filter((element) => WebComponentRegistryHelper.isUI5ElementSubclass(element))
						.map((element) => element.tagName)
						.filter((tag) => (tag ? !tag.startsWith("ui5-") : false));
					if (nonUI5TagsToRegister.length === 0) {
						nonUI5TagsToRegister = undefined;
					}
				}

				// if assets should be included we probe for the assets module
				// which is always located in dist/Assets.js for UI5 Web Components
				// and in case of resolving the module successfully we include it
				let assetsModule = posix.join(namespace, "dist/Assets.js");
				if (!(includeAssets && resolveModule(assetsModule))) {
					assetsModule = undefined;
				}

				// generate the web component package code
				const code = webcTmplFnWebCPackage({
					isBaseLib: namespace === "@ui5/webcomponents-base",
					scopeSuffix: ui5WebCScopeSuffix,
					enrichBusyIndicator,
					nonUI5TagsToRegister,
					assetsModule,
					webcPackageModule: resolveModule(namespace)?.replace(/\\/g, "/"),
				});
				return code;
			}
			return null;
		},

		generateBundle(options, bundle) {
			if (skip) {
				return;
			}

			for (const file in bundle) {
				const chunk = bundle[file];
				if (chunk.type === "chunk" && chunk.isEntry) {
					const chunkName = chunk.fileName.slice(0, extname(chunk.fileName).length * -1);
					const moduleInfo = this.getModuleInfo(chunk.facadeModuleId);
					let type = moduleInfo?.meta?.ui5?.type;
					if (type) {
						if (type === "webcomponent") {
							const { sources, clazz } = moduleInfo.meta.ui5;
							/*
							if (sources.length > 1) {
								log.warn(`The Web Component "${clazz.name}" has multiple entry points: ${sources.join(", ")}`);
							}
							*/
							for (const source of sources) {
								// emit the Web Component wrapper
								buildWrapper({ source, clazz, chunkName }, this.emitFile);
							}
						} else if (type === "package") {
							const { source, package } = moduleInfo.meta.ui5;
							buildPackage({ source, package, chunkName }, this.emitFile);
						}
						// mark the chunk as not an entry to avoid it being moved to
						// the proper namespace by the post-processing in utils.js
						chunk.isEntry = false;
					}
				}
			}
		},
	};
};

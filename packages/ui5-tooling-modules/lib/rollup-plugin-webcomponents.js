const { join, dirname, posix } = require("path");
const { readFileSync, existsSync } = require("fs");
const { createHash } = require("crypto");

const { lt, gte } = require("semver");
const { compile } = require("handlebars");

const WebComponentRegistry = require("./utils/WebComponentRegistry");

module.exports = function ({ log, resolveModule, pkgJson, getPackageJson, framework, options } = {}) {
	// derive the configuration from the provided options
	let { skip, scoping, scopeSuffix, enrichBusyIndicator, force, includeAssets } = Object.assign(
		{
			skip: false,
			scoping: true,
			enrichBusyIndicator: false,
			force: false,
			includeAssets: false, // experimental (due to race condition!)
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

	// =========================================================================
	// Helpers to determine the Web Component classes and their metadata
	// =========================================================================

	// checks wehether the given class is based on UI5Element
	const isUI5Element = (clazz) => {
		let superclass = clazz.superclass,
			isClazzUI5Element = false;
		while (superclass) {
			if (superclass?.namespace === "@ui5/webcomponents-base" && superclass?.name === "UI5Element") {
				isClazzUI5Element = true;
				break;
			}
			superclass = superclass.superclass;
		}
		return isClazzUI5Element;
	};

	// helper function to extract the npm package name from a module name
	const getNpmPackageName = (source) => {
		const npmPackageScopeRegEx = /^((?:(@[^/]+)\/)?([^/]+))(?:\/(.*))?$/;
		return npmPackageScopeRegEx.exec(source)?.[1];
	};

	let executionContext = {};

	// helper function to load a NPM package and its custom elements metadata
	const loadedNpmPackages = [];
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
					const package = loadNpmPackage(dep, emitFile);
					if (package) {
						libraryDependencies.push(package.namespace);
					}
				});

				// load custom elements metadata
				if (metadataPath) {
					const customElementsMetadata = JSON.parse(readFileSync(metadataPath, { encoding: "utf-8" }));

					// first time registering a new Web Component package
					registryEntry = WebComponentRegistry.register({
						customElementsMetadata,
						namespace: npmPackage,
						npmPackagePath,
						version: packageJson.version,
					});

					// assign the dependencies
					registryEntry.dependencies = libraryDependencies;
				}
			}
		}
		const emittedNpmPackages = (executionContext.emittedNpmPackages = executionContext.emittedNpmPackages || []);
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

	const buildPackage = ({ source, package }, emitFile) => {
		const emittedPackages = (executionContext.emittedPackages = executionContext.emittedPackages || []);
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
			types: Object.keys(package.enums).map((enumName) => `${namespace}.${enumName}`),
			interfaces: Object.keys(package.interfaces).map((interfaceName) => `${namespace}.${interfaceName}`),
			controls: Object.keys(package.customElements).map((elementName) => `${namespace}.${elementName}`),
			elements: [
				/* do we have any? */
			],
			rootPath: `${posix.relative(dirname(source), "") || "."}/`,
		};
		const metadata = JSON.stringify(metadataObject, undefined, 2);

		// is it the base library? (important for the monkey patches)
		const isBaseLib = namespace === "@ui5/webcomponents-base";

		// generate the library code
		const code = webcTmplFnUI5Package({
			isBaseLib,
			metadata,
			namespace,
			hasEnums: Object.keys(package.enums).length > 0,
			enums: package.enums,
			dependencies: package.dependencies?.map((dep) => `${rootPath}${dep}`),
			monkeyPatches: isBaseLib ? webcTmplMonkeyPatches.join("\n") : "",
		});

		emitFile({
			type: "prebuilt-chunk",
			id: source,
			fileName: `${source}.js`,
			code,
		});
		emittedPackages.push(source);
	};

	const buildWrapper = ({ source, clazz, webcSource }, emitFile) => {
		const resolvedSource = `${clazz.package}/${clazz.module.slice(0, -3)}`;
		const rootPath = `${posix.relative(dirname(source), "") || "."}/`;

		const emittedWrappers = (executionContext.emittedWrappers = executionContext.emittedWrappers || {});
		if (emittedWrappers[source]) {
			return;
		} else if (emittedWrappers[resolvedSource] && emittedWrappers[resolvedSource] !== source) {
			//console.log(`Re-exporting Web Component: ${source} for class ${resolvedSource}`);
			emitFile({
				type: "prebuilt-chunk",
				id: source,
				fileName: `${source}.js`,
				code: `/*!\n * \${copyright}\n */\nsap.ui.define(["${rootPath}${emittedWrappers[resolvedSource]}"], function(mod) { return mod; });`,
			});
			emittedWrappers[source] = source;
			return;
		} else if (emittedWrappers[resolvedSource]) {
			// already emitted
			return;
		}

		// determine whether the clazz is based on the UI5Element superclass
		const isClazzUI5Element = isUI5Element(clazz);
		if (ui5WebCScopeSuffix && !isClazzUI5Element) {
			log.warn(`The Web Component "${source}" doesn't support scoping as it is not extending UI5Element!`);
		}
		// Extend the superclass with the WebComponent class and export it
		const ui5Metadata = clazz._ui5metadata;
		const ui5Class = `${ui5Metadata.namespace}.${clazz.name}`;
		const namespace = ui5Metadata.namespace;
		const metadataObject = Object.assign({}, ui5Metadata, {
			tag: ui5Metadata.tag && (isClazzUI5Element && ui5WebCScopeSuffix ? `${ui5Metadata.tag}-${ui5WebCScopeSuffix}` : ui5Metadata.tag), // only add the suffix for UI5 Web Components (scoping support)
			library: `${ui5Metadata.namespace}.library`, // if not defined, the library is derived from the namespace
			designtime: `${ui5Metadata.namespace}/designtime/${clazz.name}.designtime`, // add a default designtime
		});
		const metadata = JSON.stringify(metadataObject, undefined, 2);
		const webcClass = webcSource;

		// UI5 specific features
		const needsLabelEnablement = clazz._ui5specifics.needsLabelEnablement;
		const needsEnabledPropagator = clazz._ui5specifics.needsEnabledPropagator;
		const needsMessageMixin = clazz._ui5specifics.needsMessageMixin;

		// Determine the superclass UI5 module name and import it
		let webcBaseClass = "sap/ui/core/webc/WebComponent";
		const ui5Superclass = clazz.superclass;
		if (ui5Superclass?._ui5metadata && !(ui5Superclass.namespace === "@ui5/webcomponents-base" && ui5Superclass.name === "UI5Element")) {
			const { module } = clazz.superclass;
			const { namespace } = clazz.superclass._ui5metadata;
			webcBaseClass = `${namespace}/${module.slice(0, -3)}`;
			if (emittedWrappers[webcBaseClass]) {
				webcBaseClass = emittedWrappers[webcBaseClass]; // resolve the superclass if already emitted
			} else {
				buildWrapper(
					{
						source: webcBaseClass,
						clazz: clazz.superclass,
					},
					emitFile,
				);
			}
		}

		// generate the WebComponentControl code
		const code = webcTmplFnUI5Control({
			ui5Class,
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
			id: source,
			fileName: `${source}.js`,
			code,
		});

		// mark the source as emitted
		emittedWrappers[resolvedSource] = source;
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

			// clear the execution context
			executionContext = {};
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
					return {
						id: absModulePath,
						meta: {
							ui5: {
								source,
								type: "webcomponent",
								clazz,
								modulePath,
								absModulePath,
							},
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
						.filter((element) => isUI5Element(element))
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
					const moduleInfo = this.getModuleInfo(chunk.facadeModuleId);
					let type = moduleInfo?.meta?.ui5?.type;
					if (type) {
						if (type === "webcomponent") {
							const { source, clazz } = moduleInfo.meta.ui5;
							const webcSource = posix.relative(dirname(source), chunk.name);
							buildWrapper({ source, clazz, webcSource }, this.emitFile);
						} else if (type === "package") {
							const { source, package } = moduleInfo.meta.ui5;
							buildPackage({ source, package }, this.emitFile);
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

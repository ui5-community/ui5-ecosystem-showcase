const { join, dirname, posix } = require("path");
const { readFileSync, existsSync } = require("fs");
const { createHash } = require("crypto");

const WebComponentRegistry = require("./utils/WebComponentRegistry");

const { compile } = require("handlebars");
const { lt, gte } = require("semver");

// TODO:
//   - enabled - disabled mapping
//   - Externalize UI5 Web Components specific code
module.exports = function ({ log, resolveModule, getPackageJson, framework, options } = {}) {
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

	// helper function to extract the npm package name from a module name
	const getNpmPackageName = (source) => {
		const npmPackageScopeRegEx = /^((?:(@[^/]+)\/)?([^/]+))(?:\/(.*))?$/;
		return npmPackageScopeRegEx.exec(source)?.[1];
	};

	// helper function to load and compile a handlebars template
	const loadAndCompileTemplate = (templatePath) => {
		const templateFile = readFileSync(join(__dirname, templatePath), { encoding: "utf-8" });
		return compile(templateFile);
	};

	// helper function to create a short hash (to scope the UI5 Web Components)
	const createShortHash = ({ name, version }) => {
		return createHash("shake256", { outputLength: 4 }).update(`${name}@${version}`).digest("hex");
	};
	const ui5WebCScopeSuffix = !!scoping && (scopeSuffix || createShortHash(require(join(process.cwd(), "package.json"))));

	// handlebars templates for the Web Components transformation
	const webcTmplFnPackage = loadAndCompileTemplate("templates/Package.hbs");
	const webcTmplFnControl = loadAndCompileTemplate("templates/WrapperControl.hbs");
	const webcTmplFnMPAttributes = loadAndCompileTemplate("templates/monkey_patches/RenderAttributeProperties.hbs");
	const webcTmplFnMPAllEvents = loadAndCompileTemplate("templates/monkey_patches/RegisterAllEvents.hbs");

	// array of all web component classes
	const webcModules = [];

	// helper function to load a NPM package and its custom elements metadata
	const emittedFiles = [];
	const loadNpmPackage = (npmPackage, emitFile) => {
		let registryEntry = WebComponentRegistry.getPackage(npmPackage);
		if (!registryEntry) {
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

		// we must emit the package module to be able to import it later
		// files should be emitted only once (emitted files are reset for the next build)
		if (registryEntry && !emittedFiles.includes(npmPackage)) {
			// each NPM package has a package module (with a concrete name) that needs to be emitted
			emitFile({
				type: "chunk",
				id: `${npmPackage}`,
				name: `${npmPackage}`,
			});
			emittedFiles.push(npmPackage);
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

	// list of external dependencies that are needed for the Web Components transformation
	const externalDeps = [
		"sap/ui/core/webc/WebComponent",
		"sap/ui/core/webc/WebComponentRenderer",
		"sap/ui/base/DataType",
		"sap/base/strings/hyphenate",
		"sap/ui/core/LabelEnablement",
		"sap/ui/core/EnabledPropagator",
	];

	return {
		name: "webcomponents",
		async resolveId(source, importer /*, options*/) {
			if (skip) {
				return null;
			}
			const importerModuleInfo = this.getModuleInfo(importer);
			const isImporterUI5Module = importerModuleInfo?.attributes?.ui5Type;

			if (!importer || isImporterUI5Module) {
				// resolve UI5 modules (hypenate is needed for WebComponentsMonkeyPatches and could be removed again)
				if (externalDeps.includes(source)) {
					// mark Ui5 runtime dependencies as external
					// to avoid warnings about missing dependencies
					return {
						id: source,
						external: true,
					};
				}

				const npmPackage = getNpmPackageName(source);
				let clazz;
				if ((clazz = lookupWebComponentsClass(source, this.emitFile))) {
					const modulePath = `${clazz.package}/${clazz.module}`;
					const absModulePath = resolveModule(modulePath);
					// id needs to be the resolved name to later be able to assign the generated code to the correct module
					// utils.js => const resolvedModule = modules.find((mod) => module?.facadeModuleId?.startsWith(mod.path));
					return {
						id: absModulePath + "?ui5Type=control", // the query parameter is needed to avoid cycles as we overlay the WebComponent class
						attributes: {
							ui5Type: "control",
							modulePath,
							absModulePath,
							clazz,
						},
					};
				} else if (new RegExp(`^${npmPackage}(.js)?$`).test(source)) {
					let package;
					if ((package = WebComponentRegistry.getPackage(npmPackage))) {
						const modulePath = `${npmPackage}.js`;
						const absModulePath = `${package.npmPackagePath}.js`;
						return {
							id: absModulePath,
							attributes: {
								ui5Type: "package",
								modulePath,
								absModulePath,
								package,
							},
						};
					}
				}
			}
		},

		async load(id) {
			if (skip) {
				return null;
			}
			const moduleInfo = this.getModuleInfo(id);
			if (moduleInfo.attributes.ui5Type === "package") {
				let lib = moduleInfo.attributes.package;
				const { namespace, version } = lib;

				// compile the library metadata
				const metadataObject = {
					name: namespace,
					version,
					dependencies: ["sap.ui.core"],
					types: Object.keys(lib.enums).map((enumName) => `${namespace}.${enumName}`),
					interfaces: Object.keys(lib.interfaces).map((interfaceName) => `${namespace}.${interfaceName}`),
					controls: Object.keys(lib.customElements).map((elementName) => `${namespace}.${elementName}`),
					elements: [
						/* do we have any? */
					],
				};
				const metadata = JSON.stringify(metadataObject, undefined, 2);

				// create the list of custom elements tags which need to be registered
				let nonUI5TagsToRegister;
				if (ui5WebCScopeSuffix) {
					nonUI5TagsToRegister = Object.values(lib.customElements)
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

				// generate the library code
				const code = webcTmplFnPackage({
					metadata,
					namespace,
					enums: lib.enums,
					hasEnums: Object.keys(lib.enums).length > 0,
					dependencies: lib.dependencies,
					isBaseLib: namespace === "@ui5/webcomponents-base",
					scopeSuffix: ui5WebCScopeSuffix,
					enrichBusyIndicator,
					nonUI5TagsToRegister,
					assetsModule,
				});
				// include the monkey patches for the Web Components base library
				// only for UI5 versions < 1.128.0 we need the attributes fix
				if (namespace === "@ui5/webcomponents-base" && lt(framework?.version || "0.0.0", "1.128.0")) {
					const monkeyPatches = webcTmplFnMPAttributes();
					return `${monkeyPatches}\n${code}`;
				}
				// only for UI5 versions < 1.132.0 we need the events fix
				if (namespace === "@ui5/webcomponents-base" && lt(framework?.version || "0.0.0", "1.132.0")) {
					const monkeyPatches = webcTmplFnMPAllEvents();
					return `${monkeyPatches}\n${code}`;
				}
				return code;
			} else if (moduleInfo.attributes.ui5Type === "control") {
				let clazz = moduleInfo.attributes.clazz;
				// determine whether the clazz is based on the UI5Element superclass
				let superclass = clazz.superclass,
					isUI5Element = false;
				while (superclass) {
					if (superclass?.name === "UI5Element") {
						isUI5Element = true;
						break;
					}
					superclass = superclass.superclass;
				}
				// Extend the superclass with the WebComponent class and export it
				const ui5Metadata = clazz._ui5metadata;
				const ui5Class = `${ui5Metadata.namespace}.${clazz.name}`;
				const namespace = ui5Metadata.namespace;
				const metadataObject = Object.assign({}, ui5Metadata, {
					tag: isUI5Element && ui5WebCScopeSuffix ? `${ui5Metadata.tag}-${ui5WebCScopeSuffix}` : ui5Metadata.tag, // only add the suffix for UI5 Web Components (scoping support)
					library: `${ui5Metadata.namespace}.library`, // if not defined, the library is derived from the namespace
					designtime: `${ui5Metadata.namespace}/designtime/${clazz.name}.designtime`, // add a default designtime
				});
				const metadata = JSON.stringify(metadataObject, undefined, 2);
				const webcModule = moduleInfo.attributes.absModulePath;
				const webcClass = webcModule.replace(/\\/g, "/"); // is the absolute path of the original Web Component class
				const needsLabelEnablement = clazz._ui5NeedsLabelEnablement;
				const needsEnabledPropagator = clazz._ui5NeedsEnabledPropagator;

				// store the webc class as a marker to add the import to @ui5/webcomponents-base
				if (!webcModules.includes(webcModule)) {
					webcModules.push(webcModule);
				}

				// Determine the superclass UI5 module name and import it
				let webcBaseClass = "sap/ui/core/webc/WebComponent";
				if (clazz.superclass?._ui5metadata) {
					const { module } = clazz.superclass;
					const { namespace } = clazz.superclass._ui5metadata;
					webcBaseClass = `${namespace}/${module}`;
				}

				// generate the WebComponentControl code
				const code = webcTmplFnControl({
					ui5Class,
					namespace,
					metadata,
					webcClass,
					webcBaseClass,
					needsLabelEnablement,
					needsEnabledPropagator,
				});
				return code;
			} else if (webcModules.includes(id)) {
				// for all Web Component classes we need to import the @ui5/webcomponents-base
				// to ensure that the basic functionality is available (enablement, scoping, etc.)
				const code = readFileSync(id, "utf-8");
				return `import "@ui5/webcomponents-base";\n${code}`;
			}
			return null;
		},
	};
};

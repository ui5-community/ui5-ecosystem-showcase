const { join, dirname } = require("path");
const { readFileSync, existsSync } = require("fs");
const WebComponentRegistry = require("./utils/WebComponentRegistry");

const { compile } = require("handlebars");
const { lt, gte } = require("semver");

module.exports = function ({ log, resolveModule, framework, skip } = {}) {
	// TODO: maybe we should derive the minimum version from the applications package.json
	//       instead of the framework version (which might be a different version)
	if (!gte(framework?.version || "0.0.0", "1.120.0")) {
		skip = true;
		log.warn("Skipping Web Components transformation as UI5 version is < 1.120.0");
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

	// handlebars templates for the Web Components transformation
	const webcTmplFnPackage = loadAndCompileTemplate("templates/Package.hbs");
	const webcTmplFnControl = loadAndCompileTemplate("templates/WrapperControl.hbs");
	const webcTmplFnPatches = loadAndCompileTemplate("templates/MonkeyPatches.hbs");

	// helper function to load a NPM package and its custom elements metadata
	const loadNpmPackage = (npmPackage, emitFile) => {
		let registryEntry = WebComponentRegistry.getPackage(npmPackage);
		if (!registryEntry) {
			const packageJsonPath = resolveModule(`${npmPackage}/package.json`);
			if (packageJsonPath) {
				const packageJson = require(packageJsonPath);
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
				Object.keys(packageJson.dependencies || {}).forEach((dep) => {
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

					// each NPM package has a package module (with a concrete name) that needs to be emitted
					emitFile({
						type: "chunk",
						id: `${npmPackage}`,
						name: `${npmPackage}`,
					});
				}
			}
		}
		return registryEntry;
	};

	// helper function to lookup a Web Component class by its module name
	const lookupWebComponentsClass = (source, emitFile) => {
		let clazz;
		if ((clazz = WebComponentRegistry.getClassDefinition(source))) {
			return clazz;
		}

		// determine npm package
		const npmPackage = getNpmPackageName(source);

		const registryEntry = loadNpmPackage(npmPackage, emitFile);
		if (registryEntry) {
			const metadata = registryEntry;
			let modulePath = resolveModule(source);
			if (modulePath) {
				modulePath = modulePath.substr(metadata.npmPackagePath.length + 1);
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
	const externalDeps = ["sap/ui/core/webc/WebComponent", "sap/ui/core/webc/WebComponentRenderer", "sap/ui/base/DataType", "sap/base/strings/hyphenate"];

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

				// generate the library code
				const code = webcTmplFnPackage({
					metadata,
					namespace,
					enums: lib.enums,
					dependencies: lib.dependencies,
				});
				// include the monkey patches for the Web Components base library
				// only for UI5 versions < 1.128.0 (otherwise the monkey patches are not needed anymore)
				if (namespace === "@ui5/webcomponents-base" && lt(framework?.version || "0.0.0", "1.128.0")) {
					const monkeyPatches = webcTmplFnPatches();
					return `${monkeyPatches}\n${code}`;
				}
				return code;
			} else if (moduleInfo.attributes.ui5Type === "control") {
				let clazz = moduleInfo.attributes.clazz;
				// Extend the superclass with the WebComponent class and export it
				const ui5Metadata = clazz._ui5metadata;
				const ui5Class = `${ui5Metadata.namespace}.${clazz.name}`;
				const namespace = ui5Metadata.namespace;
				const metadataObject = Object.assign({}, ui5Metadata, {
					library: `${ui5Metadata.namespace}.library`,
					designtime: `${ui5Metadata.namespace}/designtime/${clazz.name}.designtime`,
				});
				const metadata = JSON.stringify(metadataObject, undefined, 2);
				const webcClass = moduleInfo.attributes.absModulePath; // is the absolute path of the original Web Component class

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
				});
				return code;
			}
			return null;
		},
	};
};

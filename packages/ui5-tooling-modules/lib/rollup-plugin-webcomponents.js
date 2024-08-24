const { join, dirname } = require("path");
const { readFileSync } = require("fs");
const WebComponentRegistry = require("./utils/WebComponentRegistry");

const { compile } = require("handlebars");

module.exports = function ({ resolveModule, skip } = {}) {
	const getNpmPackageName = (source) => {
		const npmPackageScopeRegEx = /^((?:(@[^/]+)\/)?([^/]+))(?:\/(.*))?$/;
		return npmPackageScopeRegEx.exec(source)?.[1];
	};

	const loadAndCompileTemplate = (templatePath) => {
		const templateFile = readFileSync(join(__dirname, templatePath), { encoding: "utf-8" });
		return compile(templateFile);
	};

	const libTemplateFn = loadAndCompileTemplate("templates/Library.hbs");
	const webccTemplateFn = loadAndCompileTemplate("templates/WebComponentControl.hbs");

	const loadNpmPackage = (npmPackage, emitFile) => {
		let registryEntry = WebComponentRegistry.getPackage(npmPackage);
		if (!registryEntry) {
			const packageJsonPath = resolveModule(`${npmPackage}/package.json`);
			if (packageJsonPath) {
				const packageJson = require(packageJsonPath);
				// for all UI5 Web Components packages we use the internal custom elements metadata
				if (/^@ui5\/webcomponents/.test(packageJson.name)) {
					packageJson.customElements = /* packageJson.customElements || */ "dist/custom-elements-internal.json";
				}
				if (!registryEntry && packageJson.customElements) {
					// load the dependent Web Component packages
					const libraryDependencies = [];
					Object.keys(packageJson.dependencies || {}).forEach((dep) => {
						const package = loadNpmPackage(dep, emitFile);
						if (package) {
							libraryDependencies.push(package.namespace);
						}
					});

					// load custom elements metadata
					const metadataPath = resolveModule(join(npmPackage, packageJson.customElements));
					if (metadataPath) {
						const customElementsMetadata = require(metadataPath);

						// first time registering a new Web Component package
						const npmPackagePath = dirname(packageJsonPath);
						registryEntry = WebComponentRegistry.register({
							customElementsMetadata,
							namespace: npmPackage,
							npmPackagePath,
						});

						// assign the dependencies
						registryEntry.dependencies = libraryDependencies;

						// each library has a library module (with a concrete name) that needs to be emitted
						emitFile({
							type: "chunk",
							id: `${npmPackage}/library`,
							name: `${npmPackage}/library`,
						});
					}
				}
			}
		}
		return registryEntry;
	};

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

	return {
		name: "webcomponents",
		async resolveId(source, importer /*, options*/) {
			if (skip) {
				return null;
			}
			const importerModuleInfo = this.getModuleInfo(importer);
			const isImporterUI5Module = importerModuleInfo?.attributes?.ui5Type;

			if (!importer || isImporterUI5Module) {
				if (source === "sap/ui/core/webc/WebComponent" || source === "sap/ui/core/Lib" || source === "sap/ui/base/DataType") {
					// mark Ui5 runtime dependencies as external
					// to avoid warnings about missing dependencies
					return {
						id: source,
						external: true,
					};
				}

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
				} else if (source.endsWith("/library.js") || source.endsWith("/library")) {
					const npmPackage = getNpmPackageName(source);
					let package;
					if ((package = WebComponentRegistry.getPackage(npmPackage))) {
						const modulePath = `${npmPackage}/library.js`;
						const absModulePath = `${package.npmPackagePath}/library.js`;
						return {
							id: absModulePath,
							attributes: {
								ui5Type: "library",
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
			if (moduleInfo.attributes.ui5Type === "library") {
				let lib = moduleInfo.attributes.package;
				const { namespace } = lib;

				// compile the library metadata
				const metadataObject = {
					apiVersion: 2,
					name: namespace,
					dependencies: ["sap.ui.core", ...lib.dependencies],
					types: Object.keys(lib.enums).map((enumName) => `${namespace}.${enumName}`),
					elements: [
						/* do we have any? */
					],
					controls: Object.keys(lib.customElements).map((elementName) => `${namespace}.${elementName}`),
					interfaces: Object.keys(lib.interfaces).map((interfaceName) => `${namespace}.${interfaceName}`),
					designtime: `${namespace}/designtime/library.designtime`,
					extensions: {
						flChangeHandlers: {
							"@ui5/webcomponents.Avatar": {
								hideControl: "default",
								unhideControl: "default",
							},
							"@ui5/webcomponents.Button": "@ui5/webcomponents-flexibility.Button",
						},
					},
					noLibraryCSS: true,
				};
				const metadata = JSON.stringify(metadataObject, undefined, 2);

				// generate the library code
				const code = libTemplateFn({
					metadata,
					namespace,
					enums: lib.enums,
					dependencies: lib.dependencies.map((dep) => `${dep}/library`),
				});
				return code;
			} else if (moduleInfo.attributes.ui5Type === "control") {
				let clazz = moduleInfo.attributes.clazz;
				// Extend the superclass with the WebComponent class and export it
				const ui5Metadata = clazz._ui5metadata;
				const ui5Class = `${ui5Metadata.namespace}.${clazz.name}`;
				const namespace = ui5Metadata.namespace;
				const metadataObject = Object.assign({}, ui5Metadata, {
					library: `${ui5Metadata.namespace}.library`,
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
				const code = webccTemplateFn({
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

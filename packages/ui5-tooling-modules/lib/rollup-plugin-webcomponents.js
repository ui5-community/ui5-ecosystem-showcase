const { join, dirname } = require("path");
const { readFileSync } = require("fs");
const WebComponentRegistry = require('./utils/WebComponentRegistry');

const { compile } = require("handlebars");

module.exports = function ({ resolveModule } = {}) {

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

	const absToRelPathLib = {};
	const absToRelPathWebC = {};

	const loadNpmPackage = (npmPackage) => {
		let registryEntry = WebComponentRegistry.getPackage(npmPackage);
		if (!registryEntry) {
			const packageJsonPath = resolveModule(`${npmPackage}/package.json`);
			if (packageJsonPath) {
				const packageJson = require(packageJsonPath);
				if (/^@ui5\/webcomponents/.test(packageJson.name)) {
					packageJson.customElements = /* packageJson.customElements || */ "dist/custom-elements-internal.json";
				}
				if (!registryEntry && packageJson.customElements) {
					Object.keys(packageJson.dependencies || {}).forEach((dep) => {
						loadNpmPackage(dep);
					});

					// load custom elements metadata
					// load custom elements metadata (custom-elements-internal.json > custom-elements.json)
					const metadataPath = resolveModule(join(npmPackage, packageJson.customElements));
					if (metadataPath) {
						const customElementsMetadata = require(metadataPath);

						// first time registering a new Web Component package
						const npmPackagePath = dirname(packageJsonPath);
						registryEntry = WebComponentRegistry.register({
							customElementsMetadata,
							namespace: npmPackage,
							npmPackagePath
						});
						absToRelPathLib[`${npmPackagePath}/library.js`] = npmPackage;
					}
				}
			}
		}
		return registryEntry;
	};

	const lookupWebComponentsClass = (source) => {
		let absModulePath = resolveModule(source);

		let clazz;
		if ((clazz = WebComponentRegistry.getClassDefinition(absModulePath))) {
			return clazz;
		}

		// determine npm package
		const npmPackage = getNpmPackageName(source);

		const registryEntry = loadNpmPackage(npmPackage);
		if (registryEntry) {
			absModulePath = absModulePath || `${registryEntry.npmPackagePath}/library.js`;
			const metadata = registryEntry;
			const modulePath = absModulePath.substr(metadata.npmPackagePath.length + 1);
			const moduleName = `${npmPackage}/${modulePath}`;

			const clazz = WebComponentRegistry.getClassDefinition(moduleName);
			// TODO: base classes must be ignored as UI5Element is flagged as custom element although it is a base class
			if (clazz && clazz.customElement && npmPackage !== "@ui5/webcomponents-base") {
				clazz.modulePath = absModulePath;
				clazz.moduleName = moduleName;
				absToRelPathWebC[absModulePath] = moduleName;
				return clazz;
			}
		}
	}

	return {
		name: "webcomponents",
		async resolveId(source/*, importer, options*/) {
			if (
				source === "sap/ui/core/webc/WebComponent" ||
				source === "sap/ui/core/Lib" ||
				source === "sap/ui/base/DataType"
			) {
				// mark Ui5 runtime dependencies as external
				// to avoid warnings about missing dependencies
				return {
					id: source,
					external: true
				};
			}

			const npmPackageScopeRegEx = /^((?:(@[^/]+)\/)?([^/]+))(?:\/(.*))?\/library(\.js)?$/;
			const npmPackage = npmPackageScopeRegEx.exec(source)?.[1];

			let clazz, lib;
			if ((clazz = lookupWebComponentsClass(source))) {
				return `${clazz.modulePath}?control`;
			} else if ((lib = WebComponentRegistry.getPackage(npmPackage))) {
				return {
					id: `${lib.npmPackagePath}/library.js`,
					attributes: {
						npmPackage
					}
				};
			}
		},

		async load(id) {
			// TODO:
			// - @ui5/webcomponents/Button should re-export @ui5/webcomponents/dist/Button
			let lib, clazz;
			if ((lib = WebComponentRegistry.getPackage(absToRelPathLib[id]))) {
				const { namespace } = lib;

				// compile the library metadata
				const metadataObject = {
					apiVersion: 2,
					name: namespace,
					dependencies: ["sap.ui.core"],
					types:	Object.keys(lib.enums).map((enumName) => `${namespace}.${enumName}`),
					elements: [ /* do we have any? */ ],
					controls: Object.keys(lib.customElements).map((elementName) => `${namespace}.${elementName}`),
					interfaces: Object.keys(lib.interfaces).map((interfaceName) => `${namespace}.${interfaceName}`),
					designtime: `${namespace}/designtime/library.designtime`,
					extensions: {
						flChangeHandlers: {
							"@ui5/webcomponents.Avatar": {
								"hideControl": "default",
								"unhideControl": "default"
							},
							"@ui5/webcomponents.Button": "@ui5/webcomponents-flexibility.Button",
						}
					},
					noLibraryCSS: true,
				};
				const metadata = JSON.stringify(metadataObject, undefined, 2);

				// generate the library code
				const code = libTemplateFn({
					metadata,
					namespace,
					enums: lib.enums,
				});
				return code;

			} else if (id.endsWith("?control") && (clazz = WebComponentRegistry.getClassDefinition(absToRelPathWebC[id.split("?")[0]]))) {
				// Extend the superclass with the WebComponent class and export it
				const ui5Metadata = clazz._ui5metadata;
				const ui5Class = `${ui5Metadata.namespace}.${clazz.name}`;
				const namespace = ui5Metadata.namespace;
				const metadataObject = Object.assign({}, ui5Metadata, {
					library: `${ui5Metadata.namespace}.library`,
				});
				const metadata = JSON.stringify(metadataObject, undefined, 2);
				const webcClass = clazz.modulePath;

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

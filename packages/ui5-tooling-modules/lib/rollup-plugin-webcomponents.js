const { join, dirname } = require("path");
const { readFileSync } = require("fs");
const WebComponentRegistry = require('./utils/WebComponentRegistry');

const { compile } = require("handlebars");

// Inspired by https://rollupjs.org/plugin-development/#resolveid (the Polyfill Injection)
const SUFFIX_WEBC = "?webcomponent";
const SUFFIX_WEBC_LIB = "?webcomponentlibrary";

module.exports = function ({ resolveModule } = {}) {

	const loadAndCompileTemplate = (templatePath) => {
		const templateFile = readFileSync(join(__dirname, templatePath), { encoding: "utf-8" });
		return compile(templateFile);
	};

	const libTemplateFn = loadAndCompileTemplate("templates/Library.hbs");
	const webccTemplateFn = loadAndCompileTemplate("templates/WebComponentControl.hbs");

	const absToRelPathLib = {};
	const absToRelPathWebC = {};

	const lookupWebComponentsClass = (source) => {
		const absModulePath = resolveModule(source);
		if (WebComponentRegistry.getClassDefinition(absModulePath)) {
			return WebComponentRegistry.getClassDefinition(absModulePath);
		}

		// determine npm package
		const npmPackageScopeRegEx = /^((?:(@[^/]+)\/)?([^/]+))(?:\/(.*))?$/;
		const npmPackage = npmPackageScopeRegEx.exec(source)?.[1];

		let registryEntry = WebComponentRegistry.getPackage(npmPackage);

		if (!registryEntry) {
			const packageJsonPath = resolveModule(`${npmPackage}/package.json`);
			if (packageJsonPath) {
				const packageJson = require(packageJsonPath);
				if (!registryEntry && packageJson.customElements) {
					// load custom elements metadata
					// load custom elements metadata (custom-elements-internal.json > custom-elements.json)
					let metadataPath = resolveModule(join(npmPackage, packageJson.customElements.replace("custom-elements.json", "custom-elements-internal.json")));
					if (!metadataPath) {
						metadataPath = resolveModule(join(npmPackage, packageJson.customElements));
					}
					const customElementsMetadata = require(metadataPath);

					// first time registering a new Web Component package
					const npmPackagePath = dirname(packageJsonPath);
					registryEntry = WebComponentRegistry.register({
						customElementsMetadata,
						namespace: npmPackage,
						npmPackagePath
					});
					absToRelPathLib[npmPackagePath] = npmPackage;
				}
			}
		}

		if (registryEntry) {
			const metadata = registryEntry;
			const modulePath = absModulePath.substr(metadata.npmPackagePath.length + 1);
			const moduleName = `${npmPackage}/${modulePath}`;

			const clazz = WebComponentRegistry.getClassDefinition(moduleName);
			clazz.modulePath = absModulePath;
			clazz.moduleName = moduleName;
			absToRelPathWebC[absModulePath] = moduleName;
			return clazz;
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
			} else if (/^(.*)\/library(?:.js)?$/.test(source)) {
				// remove /library using regex
				const parts = /^(.*)\/library(?:.js)?$/.exec(source);
				const package = parts && WebComponentRegistry.getPackage(parts[1]);
				if (package) {
					return `${package.npmPackagePath}/library${SUFFIX_WEBC_LIB}`;
				}
			} else {
				// find the Web Components class for the given module
				const clazz = lookupWebComponentsClass(source);
				if (clazz) {
					return `${clazz.modulePath}${SUFFIX_WEBC}`;
				}
			}
		},

		async load(id) {
			// TODO:
			// - @ui5/webcomponents/Button should re-export @ui5/webcomponents/dist/Button
			if (id.indexOf(SUFFIX_WEBC_LIB) !== -1) {
				const entryId = id.slice(0, id.indexOf(SUFFIX_WEBC_LIB));
				const parts = /^(.*)\/library(?:.js)?$/.exec(entryId);
				const packageName = parts && absToRelPathLib[parts[1]];
				const package = WebComponentRegistry.getPackage(packageName);
				if (package) {
					const { namespace } = package;

					// compile the library metadata
					const metadataObject = {
						apiVersion: 2,
						name: namespace,
						dependencies: ["sap.ui.core"],
						types:	Object.keys(package.enums).map((enumName) => `${namespace}.${enumName}`),
						elements: [ /* do we have any? */ ],
						controls: Object.keys(package.customElements).map((elementName) => `${namespace}.${elementName}`),
						interfaces: Object.keys(package.interfaces).map((interfaceName) => `${namespace}.${interfaceName}`),
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
						enums: package.enums,
					});
					return code;
				}

			} else if (id.indexOf(SUFFIX_WEBC) !== -1) {
				// get the WebComponent class definition
				const entryId = id.slice(0, id.indexOf(SUFFIX_WEBC));
				const moduleName = absToRelPathWebC[entryId];
				const clazz = WebComponentRegistry.getClassDefinition(moduleName);
				if (!clazz) {
					return null;
				}

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

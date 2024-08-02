const { join, dirname, extname } = require("path");
const WebComponentRegistry = require('./utils/WebComponentRegistry');

// Inspired by https://rollupjs.org/plugin-development/#resolveid (the Polyfill Injection)
const SUFFIX_WEBC = "?webcomponent";
const SUFFIX_WEBC_LIB = "?webcomponent-library";

module.exports = function ({ resolveModule } = {}) {

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
					const metadataPath = resolveModule(join(npmPackage, packageJson.customElements.replace("custom-elements.json", "custom-elements-internal.json")));
					const customElementsMetadata = require(metadataPath);

					// first time registering a new Web Component package
					registryEntry = WebComponentRegistry.register({
						customElementsMetadata,
						namespace: npmPackage,
						npmPackagePath: dirname(packageJsonPath)
					});
				}
			}
		}

		if (registryEntry) {
			const metadata = registryEntry;
			const modulePath = absModulePath.substr(metadata.npmPackagePath.length + 1);

			const clazz = WebComponentRegistry.getClassDefinition(modulePath);
			clazz.modulePath = absModulePath;
			clazz.moduleName = `${npmPackage}/${modulePath.substr(0, modulePath.length - extname(modulePath).length)}`;
			// add th absolute module path as an alias for the class,
			// so we can look it up faster the next time around
			WebComponentRegistry.addClassAlias(absModulePath, clazz);
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
				if (parts && WebComponentRegistry.getPackage(parts[1])) {
					return `${source}${SUFFIX_WEBC_LIB}`;
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
			if (id.endsWith(SUFFIX_WEBC_LIB)) {
				const entryId = id.slice(0, -SUFFIX_WEBC_LIB.length);
				const parts = /^(.*)\/library(?:.js)?$/.exec(entryId);
				if (parts && WebComponentRegistry.getPackage(parts[1])) {
					const namespace = parts[1];
					const metadata = WebComponentRegistry.getPackage(namespace);

					let code = `import Library from "sap/ui/core/Lib";\n`;
					code += `import { registerEnum } from "sap/ui/base/DataType";\n`;

					code += `const theLibrary = Library.init(${JSON.stringify({
						apiVersion: 2,
						name: `${namespace}`,
						//version: metadata.version,
						dependencies: ["sap.ui.core"],
						designtime: `${namespace}/designtime/library.designtime`,
						types:	Object.keys(metadata.enums).map((enumName) => `${namespace}.${enumName}`),
						elements: [],
						controls: [ /* TODO */ ],
						extensions: {
							flChangeHandlers: {
								"@ui5/webcomponents/dist/Avatar": {
									"hideControl": "default",
									"unhideControl": "default"
								},
								"@ui5/webcomponents/dist/Button": "@ui5/webcomponents-flexibility/dist/Button",
							}
						},
						noLibraryCSS: true,
					}, undefined, 2)});\n`;

					const registerEnum = (enumName, enumDef) => {
						const enumValues = {};
						enumDef.members.forEach((entry) => {
							enumValues[entry.name] = entry.name;
						});
						code += `theLibrary["${enumName}"] = ${JSON.stringify(enumValues)};\n`;
						code += `registerEnum(${JSON.stringify(`${namespace}.${enumName}`)}, theLibrary["${enumName}"]);\n`;
					}

					// register the enums
					Object.keys(metadata.enums).forEach((enumName) => {
						registerEnum(enumName, metadata.enums[enumName]);
					});

					code += `export default theLibrary;\n`;

					return code;
				}

			} else if (id.endsWith(SUFFIX_WEBC)) {
				const entryId = id.slice(0, -SUFFIX_WEBC.length);
				const clazz = WebComponentRegistry.getClassDefinition(entryId);
				if (!clazz) {
					return null;
				}

				// Import the original WebComponent class (which should be wrapped!)
				let code = `import WebComponentClass from ${JSON.stringify(entryId)};\n`;
				code += `import ${JSON.stringify(`${clazz._ui5metadata.namespace}/library`)};\n`;
				// Determine the superclass UI5 module name and import it
				let superclassModule = "sap/ui/core/webc/WebComponent";
				if (clazz.superclass._ui5metadata) {
					const { module } = clazz.superclass;
					const { namespace } = clazz.superclass._ui5metadata;
					superclassModule = `${namespace}/${module}`;
				}
				code += `import WebComponentBaseClass from ${JSON.stringify(superclassModule)};\n`;
				// Extend the superclass with the WebComponent class and export it
				const moduleName = clazz.moduleName;
				const metadata = Object.assign({}, clazz._ui5metadata, {
					library: `${clazz._ui5metadata.namespace}.library`,
				});
				code += `export default WebComponentBaseClass.extend(${JSON.stringify(moduleName)}, { metadata: ${JSON.stringify(metadata, undefined, 2)} });\n`;
				return code;
			}
			return null;
		},
	};
};

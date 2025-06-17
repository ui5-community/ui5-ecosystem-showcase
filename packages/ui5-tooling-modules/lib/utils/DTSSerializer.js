const prettier = require("prettier");
const { join } = require("path");
const { writeFileSync, readFileSync } = require("fs");

const handlebars = require("handlebars");
const WebComponentRegistryHelper = require("./WebComponentRegistryHelper");

handlebars.registerHelper("escapeInterfaceName", function (namespace, interfaceName) {
	const ui5QualifiedName = `${namespace}.${interfaceName}`;
	return `__implements_${ui5QualifiedName.replace(/[/.@-]/g, "_")}: boolean;`;
});

handlebars.registerHelper("generateApiDocumentation", function (description) {
	return description
		? Templates.apiDocumentation({
				description,
			})
		: "";
});

handlebars.registerHelper("generateImports", function (module, info) {
	let imports = "import { ";
	for (const key in info) {
		if (info[key].default) {
			imports += "default as ";
		}
		imports += key;
		imports += ", ";
	}
	imports = imports.replace(/,\s$/, ` } from "${module}";`);
	return imports;
});

handlebars.registerHelper("join", function (array) {
	return array.join(", ");
});

handlebars.registerHelper("generateEventSettings", function (className, eventName) {
	return `${className}$${eventName.replace(/^([a-z])/, (g) => g.toUpperCase())}Event`;
});

handlebars.registerHelper("generateAggregationSettings", function (types) {
	let result = "";
	for (const type of types) {
		result += `${type.multiple ? `Array<${type.types.map((t) => t.dtsType).join(" | ")}> | ${type.types.map((t) => t.dtsType).join(" | ")}` : type.dtsType} | `;
	}
	result += "AggregationBindingInfo | `{${string}}`";
	return result;
});

handlebars.registerHelper("generatePropertySettings", function (types) {
	let result = "";
	for (const type of types) {
		result += `${type.multiple ? `Array<${type.types.map((t) => t.dtsType).join(" | ")}>` : type.dtsType} |`;
	}
	result += `PropertyBindingInfo${this.needsBindingString ? " | `{${string}}`" : ""}`;
	return result;
});

handlebars.registerHelper("generateAssociationSettings", function (types) {
	let result = "";
	let multiple = false;
	for (const type of types) {
		multiple = multiple || type.multiple;
		result += `${type.multiple ? `Array<${type.types.map((t) => t.dtsType).join(" | ")}> | ${type.types.map((t) => t.dtsType).join(" | ")}` : type.dtsType} |`;
	}
	if (!result.includes("string")) {
		result += `${multiple ? " Array<string> | " : ""}string;`;
	}
	return result.replace(/\s\|$/, ";");
});

handlebars.registerHelper("serializeTypeList", function (types) {
	let result = "";
	for (const type of types) {
		result += `${type.multiple ? `Array<${type.types.map((t) => t.dtsType).join(" | ")}>` : type.dtsType} |`;
	}
	return result.replace(/\s\|$/, ";");
});

/**
 * All needed HBS templates for serializing JSDoc comments.
 */
const Templates = {
	apiDocumentation: loadAndCompileTemplate("../templates/dts/ApiDocumentation.hbs"),
	module: loadAndCompileTemplate("../templates/dts/Module.hbs"),
	class: loadAndCompileTemplate("../templates/dts/Class.hbs"),
};

/**
 * helper function to load and compile a handlebars template
 */
function loadAndCompileTemplate(templatePath) {
	const templateFile = readFileSync(join(__dirname, templatePath), { encoding: "utf-8" });
	return handlebars.compile(templateFile);
}

const DTSSerializer = {
	prepare: function (registryEntry) {
		const typeFile =
			Templates.module({
				registryEntry,
			}) +
			Templates.class({
				classes: registryEntry.classes,
				BINDING_STRING_PLACEHOLDER: "`{${string}}`",
			});
		prettier.format(typeFile, { semi: false, parser: "typescript" }).then((prettifiedTypes) => {
			if (prettifiedTypes) {
				writeFileSync(join(__dirname, "generated_types", `${registryEntry.qualifiedNamespace}.d.ts`), prettifiedTypes, { encoding: "utf-8" });
			}
		});
	},
	initClass(classDef) {
		classDef._dts = {
			imports: {},
			settings: {},
			properties: {},
			aggregations: {},
			associations: {},
			events: {},
			writeImports(importSource, namedImport, importOptions) {
				this.imports[importSource] ??= {};
				this.imports[importSource][namedImport] = Object.assign({}, importOptions);
			},
			writeProperties(propertyInfo) {
				propertyInfo.needsBindingString = true;
				// Add default import for properties
				this.writeImports("sap/ui/base/ManagedObject", "PropertyBindingInfo");

				propertyInfo.types.forEach((type) => {
					if (type.dtsType === "string") {
						propertyInfo.needsBindingString = false;
					}
					if (type.packageName) {
						this.writeImports(type.packageName, type.dtsType);
					}
				});
				this.properties[propertyInfo.name] = Object.assign({}, propertyInfo);
			},
			writeAggregations(aggregationInfo) {
				const addImportsFromTypes = (type) => {
					if (type.packageName) {
						this.writeImports(type.packageName, type.dtsType, { default: type.isClass });
					}
				};
				// Add default import for aggregations
				this.writeImports("sap/ui/base/ManagedObject", "AggregationBindingInfo");

				aggregationInfo.types.forEach((type) => {
					if (type.multiple) {
						type.types.forEach(addImportsFromTypes);
					} else {
						addImportsFromTypes(type);
					}
				});
				this.aggregations[aggregationInfo.name] = Object.assign({}, aggregationInfo);
			},
			writeAssociations(associationInfo) {
				const addImportsFromTypes = (type) => {
					if (type.packageName) {
						this.writeImports(type.packageName, type.dtsType);
					}
				};
				associationInfo.types.forEach((type) => {
					if (type.multiple) {
						type.types.forEach(addImportsFromTypes);
					} else {
						addImportsFromTypes(type);
					}
				});
				this.associations[associationInfo.name] = Object.assign({}, associationInfo);
			},
			writeEvents(eventInfo) {
				const addImportsFromTypes = (type) => {
					if (type.packageName) {
						this.writeImports(type.packageName, type.dtsType, { default: type.isClass });
					}
				};
				// Add default import for events
				this.writeImports("sap/ui/base/Event", "Event");

				for (const paramName in eventInfo.parameters) {
					const param = eventInfo.parameters[paramName];
					param.types.forEach((type) => {
						if (type.multiple) {
							type.types.forEach(addImportsFromTypes);
						} else {
							addImportsFromTypes(type);
						}
					});
				}
				this.events[eventInfo.name] = Object.assign({}, eventInfo);
			},
		};

		if (classDef.superclass) {
			let superclassSettings;
			if (WebComponentRegistryHelper.isUI5Element(classDef.superclass)) {
				superclassSettings = {
					class: "WebComponent",
					module: "sap/ui/core/webc/WebComponent",
				};
			} else {
				superclassSettings = {
					class: classDef.superclass.name,
					module: classDef.superclass._ui5QualifiedNameSlashes,
				};
			}
			classDef._dts.implementsMarker = classDef._ui5implements;
			if (classDef._dts.implementsMarker) {
				classDef._dts.implements = classDef._dts.implementsMarker.map((interfaceDef) => interfaceDef.name);
				for (const interfaceDef of classDef._dts.implementsMarker) {
					classDef._dts.writeImports(interfaceDef.package, interfaceDef.name);
				}
			}
			// generateSuperclassInfo(superclassSettings);
			classDef._dts.writeImports(superclassSettings.module, superclassSettings.class, { default: true });
			classDef._dts.writeImports(superclassSettings.module, `$${superclassSettings.class}Settings`);
			classDef._dts.extends = superclassSettings.class;
		}
	},

	// classDef._dts["imports"]['sap/ui/core/webc/WebComponent']["WebComponent"] = {default: true}
	// classDef._dts["imports"]['@ui5/webcomponents-fiori']["SideContentPosition"] = {}
	// classDef._dts["properties"]["sideContentPosition"] = { typeImportRef: "SideContentPosition" }

	// classDef._dts["imports"]['sap/ui/core/library']["CSSSize"] = {}
	// classDef._dts["properties"]["width"] = { typeImportRef: "CSSSize" }
	// classDef._dts["properties"]["height"] = { typeImportRef: "CSSSize" }

	// classDef._dts["imports"]['sap/ui/core/library']["CSSSize"] = { importAs: "sap_ui_core_CSSSize" }
	// classDef._dts["properties"]["width"] = { typeImportRef: "sap_ui_core_CSSSize" }

	// classDef._dts["imports"]['sap/ui/core/library']["CSSSize"] = {}
	// classDef._dts["properties"]["width"] = { typeImportRef: "sap_ui_core_library_CSSSize" }
	writeDts(classDef, entityType, entityDef) {
		// we clone the objects here to prevent accidental side effects
		classDef._dts[entityType][entityDef.name] = Object.assign({}, entityDef);
	},
};

module.exports = DTSSerializer;

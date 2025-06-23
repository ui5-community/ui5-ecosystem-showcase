const prettier = require("prettier");
const { join } = require("path");
const { writeFileSync, readFileSync } = require("fs");

const handlebars = require("handlebars");
const WebComponentRegistryHelper = require("./WebComponentRegistryHelper");

const capitalize = (value) => value.replace(/^([a-z])/, (g) => g.toUpperCase());

handlebars.registerHelper("escapeInterfaceName", function (namespace, interfaceName) {
	const ui5QualifiedName = `${namespace}.${interfaceName}`;
	return `__implements_${ui5QualifiedName.replace(/[/.@-]/g, "_")}: boolean;`;
});

handlebars.registerHelper("generateLinkRef", function (getterName, property) {
	return `{@link #${getterName} ${property}}`;
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
	return `${className}$${capitalize(eventName)}Event`;
});

handlebars.registerHelper("generateAggregationSettings", function (types) {
	let result = "";
	for (const type of types) {
		result += `${type.multiple ? `Array<${type.types.map((t) => t.dtsType).join(" | ")}> | ${type.types.map((t) => t.dtsType).join(" | ")}` : type.dtsType} | `;
	}
	result += "AggregationBindingInfo | `{${string}}`";
	return result;
});
const generatePropertySettings = function (types) {
	let result = "";
	for (const type of types) {
		result += `${type.multiple ? `Array<${type.types.map((t) => t.dtsType).join(" | ")}>` : type.dtsType} |`;
	}
	return result.replace(/\s\|$/, "");
};
const generatePropertySettingsWithBindingInfo = function (types) {
	let result = generatePropertySettings(types);
	result += ` | PropertyBindingInfo${this.needsBindingString ? " | `{${string}}`" : ""}`;
	return result;
};
handlebars.registerHelper("generatePropertySettings", generatePropertySettings);
handlebars.registerHelper("generatePropertySettingsWithBindingInfo", generatePropertySettingsWithBindingInfo);

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
	getPropertyDocumentation: loadAndCompileTemplate("../templates/dts/GetPropertyDocumentation.hbs"),
	setPropertyDocumentation: loadAndCompileTemplate("../templates/dts/SetPropertyDocumentation.hbs"),
	getAggregationDocumentation: loadAndCompileTemplate("../templates/dts/GetAggregationDocumentation.hbs"),
	setAggregationDocumentation: loadAndCompileTemplate("../templates/dts/SetAggregationDocumentation.hbs"),
	addAggregationDocumentation: loadAndCompileTemplate("../templates/dts/AddAggregationDocumentation.hbs"),
	bindAggregationDocumentation: loadAndCompileTemplate("../templates/dts/BindAggregationDocumentation.hbs"),
	unbindAggregationDocumentation: loadAndCompileTemplate("../templates/dts/UnbindAggregationDocumentation.hbs"),
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
			methods: {},
			writeImports(importSource, namedImport, importOptions) {
				this.imports[importSource] ??= {};
				this.imports[importSource][namedImport] = Object.assign({}, importOptions);
			},
			writeProperties(propertyInfo) {
				propertyInfo.needsBindingString = true;
				// Add default import for properties
				this.writeImports("sap/ui/base/ManagedObject", "PropertyBindingInfo");

				// TODO hacky quick fix
				if (propertyInfo.name === "for") {
					propertyInfo.name = "labelFor";
				}

				// Detect dependencies and add imports
				propertyInfo.types.forEach((type) => {
					if (type.dtsType === "string") {
						propertyInfo.needsBindingString = false;
					}
					if (type.packageName) {
						this.writeImports(type.packageName, type.dtsType);
					}
				});

				// Add property information
				this.properties[propertyInfo.name] = Object.assign({}, propertyInfo);

				const capitalizedPropertyName = capitalize(propertyInfo.name);

				// Generate methods
				this.methods[`get${capitalizedPropertyName}`] = {
					params: {},
					description: Templates.getPropertyDocumentation({
						getterName: `get${capitalizedPropertyName}`,
						property: propertyInfo.name,
						description: propertyInfo.description,
						defaultValue: propertyInfo.defaultValue,
					}),
					returnValueTypes: propertyInfo.types,
				};
				const setter = {
					params: {},
					description: Templates.setPropertyDocumentation({
						getterName: `get${capitalizedPropertyName}`,
						property: propertyInfo.name,
						description: propertyInfo.description,
						defaultValue: propertyInfo.defaultValue,
					}),
					returnValueTypes: [{ dtsType: "this" }],
				};
				// TODO do we always need to add `null` as possible type for value reset?
				setter.params[propertyInfo.name] = propertyInfo.types;
				this.methods[`set${capitalizedPropertyName}`] = setter;

				// TODO Clarify bind methods
				// this.methods[`bind${capitalizedPropertyName}`] = {
				// 	params: {
				// 		bindingInfo: [{dtsType: "PropertyBindingInfo"}]
				// 	},
				// 	returnValueTypes: [{dtsType: "this"}]
				// };
				// this.methods[`unbind${capitalizedPropertyName}`] = {
				// 	params: {},
				// 	returnValueTypes: [{dtsType: "this"}]
				// };
			},
			writeAggregations(aggregationInfo) {
				const rPlural = /(children|ies|ves|oes|ses|ches|shes|xes|s)$/i;
				const mSingular = { children: -3, ies: "y", ves: "f", oes: -2, ses: -2, ches: -2, shes: -2, xes: -2, s: -1 };

				const getMethodTemplate = function (returnValue) {
					const defaultReturnValue = [{ dtsType: "this" }];
					return {
						params: {},
						returnValueTypes: returnValue || defaultReturnValue,
					};
				};

				const guessSingularName = function (sName) {
					return sName.replace(rPlural, function ($, sPlural) {
						const vRepl = mSingular[sPlural.toLowerCase()];
						return typeof vRepl === "string" ? vRepl : sPlural.slice(0, vRepl);
					});
				};
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
				const multiple = !!aggregationInfo.types[0].multiple;
				const capitalizedAggregationName = capitalize(aggregationInfo.name);

				// Generate methods
				this.methods[`get${capitalizedAggregationName}`] = {
					params: {},
					description: Templates.getAggregationDocumentation({
						getterName: `get${capitalizedAggregationName}`,
						aggregation: aggregationInfo.name,
						description: aggregationInfo.description,
					}),
					returnValueTypes: aggregationInfo.types,
				};

				this.methods[`bind${capitalizedAggregationName}`] = {
					params: {
						bindingInfo: [{ dtsType: "AggregationBindingInfo" }],
					},
					description: Templates.bindAggregationDocumentation({
						getterName: `get${capitalizedAggregationName}`,
						aggregation: aggregationInfo.name,
					}),
					returnValueTypes: [{ dtsType: "this" }],
				};
				this.methods[`unbind${capitalizedAggregationName}`] = {
					params: {},
					description: Templates.unbindAggregationDocumentation({
						getterName: `get${capitalizedAggregationName}`,
						aggregation: aggregationInfo.name,
					}),
					returnValueTypes: [{ dtsType: "this" }],
				};
				this.methods[`destroy${capitalizedAggregationName}`] = {
					params: {},
					returnValueTypes: [{ dtsType: "this" }],
				};

				if (multiple) {
					const singularName = guessSingularName(aggregationInfo.name);

					const addMutator = getMethodTemplate();
					addMutator.params[singularName] = aggregationInfo.types[0].types;
					(addMutator.description = Templates.setAggregationDocumentation({
						getterName: `get${capitalizedAggregationName}`,
						aggregation: aggregationInfo.name,
					})),
						(this.methods[`add${capitalize(singularName)}`] = addMutator);

					const insertMutator = getMethodTemplate();
					insertMutator.params[singularName] = aggregationInfo.types[0].types;
					insertMutator.params["index"] = [{ dtsType: "int" }];
					this.methods[`insert${capitalize(singularName)}`] = insertMutator;

					const removeMutator = getMethodTemplate([...aggregationInfo.types[0].types, { dtsType: "null" }]);
					removeMutator.params[singularName] = [...aggregationInfo.types[0].types, { dtsType: "int" }, { dtsType: "ID" }];
					this.methods[`remove${capitalize(singularName)}`] = removeMutator;

					this.methods[`removeAll${capitalizedAggregationName}`] = getMethodTemplate(aggregationInfo.types);

					const indexOfMutator = getMethodTemplate([{ dtsType: "int" }]);
					indexOfMutator.params[singularName] = [...aggregationInfo.types[0].types];
					this.methods[`indexOf${capitalize(singularName)}`] = indexOfMutator;
				} else {
					// TBC Does this case even exist in the webc world?
					const setter = getMethodTemplate();
					setter.params[aggregationInfo.name] = aggregationInfo.types;
					(setter.description = Templates.setAggregationDocumentation({
						getterName: `get${capitalizedAggregationName}`,
						aggregation: aggregationInfo.name,
					})),
						(this.methods[`set${capitalizedAggregationName}`] = setter);
				}
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
			writeMethods(/**methodInfo*/) {
				// TODO implement
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

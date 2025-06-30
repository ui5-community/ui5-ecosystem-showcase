const prettier = require("prettier");
const { join } = require("path");
const { writeFileSync, readFileSync } = require("fs");

const handlebars = require("handlebars");
const WebComponentRegistryHelper = require("./WebComponentRegistryHelper");

const rPlural = /(children|ies|ves|oes|ses|ches|shes|xes|s)$/i;
const mSingular = { children: -3, ies: "y", ves: "f", oes: -2, ses: -2, ches: -2, shes: -2, xes: -2, s: -1 };

const guessSingularName = function (sName) {
	return sName.replace(rPlural, function ($, sPlural) {
		const vRepl = mSingular[sPlural.toLowerCase()];
		return typeof vRepl === "string" ? vRepl : sPlural.slice(0, vRepl);
	});
};

const capitalize = (value) => value.replace(/^([a-z])/, (g) => g.toUpperCase());

/**
 * Handlebar Helpers
 */

handlebars.registerHelper("escapeInterfaceName", function (namespace, interfaceName) {
	const ui5QualifiedName = `${namespace}.${interfaceName}`;
	return `__implements_${ui5QualifiedName.replace(/[/.@-]/g, "_")}: boolean;`;
});

const generateLinkRef = function (getterName, property) {
	return `{@link #${getterName} ${property}}`;
};

handlebars.registerHelper("generateLinkRef", generateLinkRef);

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

const generateEventSettings = function (className, eventName) {
	return `${className}$${capitalize(eventName)}Event`;
};
handlebars.registerHelper("generateEventSettings", generateEventSettings);

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
		if (type.isEnum) {
			result += ` keyof typeof ${type.dtsType} |`;
		}
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
		prettier
			.format(
				Templates.module({
					registryEntry,
				}),
				{ semi: false, parser: "typescript" },
			)
			.then((prettifiedTypes) => {
				if (prettifiedTypes) {
					writeFileSync(join(__dirname, "generated_types", `${registryEntry.qualifiedNamespace}.d.ts`), prettifiedTypes, { encoding: "utf-8" });
				}
			});
		for (const clazz in registryEntry.classes) {
			if (registryEntry.classes[clazz].superclass) {
				prettier
					.format(
						Templates.class({
							clazz: registryEntry.classes[clazz],
							BINDING_STRING_PLACEHOLDER: "`{${string}}`",
						}),
						{ semi: false, parser: "typescript" },
					)
					.then((prettifiedTypes) => {
						if (prettifiedTypes) {
							writeFileSync(join(__dirname, "generated_types", `${registryEntry.qualifiedNamespace}.dist.${clazz}.d.ts`), prettifiedTypes, { encoding: "utf-8" });
						}
					});
			}
		}
	},
	initClass(classDef) {
		classDef._dts = {
			globalImports: {},
			imports: {},
			settings: {},
			properties: {},
			aggregations: {},
			associations: {},
			events: {},
			methods: {},
		};
	},
	writeClassBody(classDef) {
		const getMethodTemplate = function ({ params = {}, description = "", returnValueTypes = [{ dtsType: "this" }] } = {}) {
			return {
				params,
				description,
				returnValueTypes,
			};
		};
		const addImportsFromTypes = (type) => {
			if (type.packageName) {
				writeImports(type.packageName, type.dtsType, { default: type.isClass, global: type.globalImport });
			}
		};
		/**
		 * Inner helper functions to write properties, aggregations, associations, events and other methods
		 */

		/**
		 * Prepares all necessary information to later generate the correct import statements for a given class.
		 *
		 * This method gathers the required details for constructing import statements, enabling subsequent processes
		 * to generate the import statements accurately.
		 *
		 * @param {string} importSource The path to the module from which the import should be loaded.
		 * @param {string} namedImport The name of the export as well as the variable name to be used for the import.
		 * @param {object} importOptions An object containing additional import configurations. Currently, it specifies
		 *                               whether the import is a default import or a named import.
		 */
		function writeImports(importSource, namedImport, importOptions) {
			classDef._dts[importOptions?.global ? "globalImports" : "imports"][importSource] ??= {};
			classDef._dts[importOptions?.global ? "globalImports" : "imports"][importSource][namedImport] = Object.assign({}, importOptions);
		}

		/**
		 * Generates all necessary components for a property, including imports, methods,
		 * and binding information.
		 *
		 * This method streamlines the process of creating all required elements for a
		 * specified property, ensuring that the resulting code is comprehensive and
		 * ready for integration.
		 *
		 * @param {string} propertyName The name of the property for which the components should
		 *                              be generated. This name will be used to create the relevant
		 *                              parts, such as import statements, methods, and binding
		 *                              configurations.
		 */
		function writeProperties(propertyName) {
			const propertyInfo = classDef._dts.properties[propertyName];
			propertyInfo.needsBindingString = propertyInfo.readonly ? false : true;

			// Detect dependencies and add imports
			propertyInfo.types.forEach((type) => {
				if (type.dtsType === "string") {
					propertyInfo.needsBindingString = false;
				}
				if (type.packageName) {
					addImportsFromTypes(type);
				}
			});

			const capitalizedPropertyName = capitalize(propertyInfo.name);

			// Generate methods
			classDef._dts.methods[`get${capitalizedPropertyName}`] = getMethodTemplate({
				description: Templates.getPropertyDocumentation({
					getterName: `get${capitalizedPropertyName}`,
					property: propertyInfo.name,
					description: propertyInfo.description,
					defaultValue: propertyInfo.defaultValue,
				}),
				returnValueTypes: propertyInfo.types,
			});

			if (propertyInfo.readonly) {
				delete classDef._dts.properties[propertyName];
			} else {
				// Add default import for properties
				writeImports("sap/ui/base/ManagedObject", "PropertyBindingInfo");
				classDef._dts.methods[`set${capitalizedPropertyName}`] = getMethodTemplate({
					params: {
						[propertyInfo.name]: [...propertyInfo.types, { dtsType: "null" }],
					},
					description: Templates.setPropertyDocumentation({
						getterName: `get${capitalizedPropertyName}`,
						property: propertyInfo.name,
						description: propertyInfo.description,
						defaultValue: propertyInfo.defaultValue,
					}),
				});
			}
		}
		/**
		 * Generates all necessary components for an aggregation, including imports, methods,
		 * and binding information.
		 *
		 * This method streamlines the process of creating all required elements for a
		 * specified aggregation, ensuring that the resulting code is comprehensive and
		 * ready for integration.
		 *
		 * @param {string} aggregationName The name of the aggregation for which the components should
		 *                                 be generated. This name will be used to create the relevant
		 *                                 parts, such as import statements, methods, and binding
		 *                                 configurations.
		 */
		function writeAggregations(aggregationName) {
			const aggregationInfo = classDef._dts.aggregations[aggregationName];
			// Add default import for aggregations
			writeImports("sap/ui/base/ManagedObject", "AggregationBindingInfo");
			writeImports("sap/ui/core/library", "ID");

			aggregationInfo.types.forEach((type) => {
				if (type.multiple) {
					type.types.forEach(addImportsFromTypes);
				} else {
					addImportsFromTypes(type);
				}
			});
			const multiple = !!aggregationInfo.types[0].multiple;
			const capitalizedAggregationName = capitalize(aggregationInfo.name);
			const linkRef = generateLinkRef(capitalizedAggregationName, aggregationInfo.name);

			// Generate methods
			classDef._dts.methods[`get${capitalizedAggregationName}`] = getMethodTemplate({
				description: Templates.getAggregationDocumentation({
					getterName: `get${capitalizedAggregationName}`,
					aggregation: aggregationInfo.name,
					description: aggregationInfo.description,
				}),
				returnValueTypes: aggregationInfo.types,
			});
			classDef._dts.methods[`destroy${capitalizedAggregationName}`] = getMethodTemplate({
				description: Templates.apiDocumentation({
					description: `Destroys the ${aggregationInfo.name} in the aggregation ${linkRef}.\n *\n * \n * @returns Reference to \`this\` in order to allow method chaining`,
				}),
			});

			if (multiple) {
				const singularName = guessSingularName(aggregationInfo.name);

				classDef._dts.methods[`add${capitalize(singularName)}`] = getMethodTemplate({
					params: {
						[singularName]: aggregationInfo.types[0].types,
					},
					description: Templates.setAggregationDocumentation({
						getterName: `get${capitalizedAggregationName}`,
						aggregation: aggregationInfo.name,
					}),
				});

				classDef._dts.methods[`insert${capitalize(singularName)}`] = getMethodTemplate({
					params: {
						[singularName]: aggregationInfo.types[0].types,
						["index"]: [{ dtsType: "int" }],
					},
					description: Templates.apiDocumentation({
						description: `Inserts a ${aggregationInfo.name} into the aggregation ${linkRef}.\n *\n * \n * @returns Reference to \`this\` in order to allow method chaining`,
					}),
				});

				classDef._dts.methods[`remove${capitalize(singularName)}`] = getMethodTemplate({
					params: {
						[singularName]: [...aggregationInfo.types[0].types, { dtsType: "int" }, { dtsType: "ID" }],
					},
					description: Templates.apiDocumentation({
						// TODO a/an depends on the aggregation name ...
						description: `Removes an ${aggregationInfo.name} from the aggregation ${linkRef}.\n *\n * \n * @returns The removed endContent or \`null\``,
					}),
					returnValueTypes: [...aggregationInfo.types[0].types, { dtsType: "null" }],
				});

				classDef._dts.methods[`removeAll${capitalizedAggregationName}`] = getMethodTemplate({
					description: Templates.apiDocumentation({
						// TODO second sentence correct?
						description: `Removes all the controls from the aggregation ${linkRef}.\n *\n * Additionally, it unregisters them from the hosting UIArea.\n *\n * \n * @returns An array of the removed elements (might be empty)`,
					}),
					returnValueTypes: aggregationInfo.types,
				});

				classDef._dts.methods[`indexOf${capitalize(singularName)}`] = getMethodTemplate({
					params: {
						[singularName]: [...aggregationInfo.types[0].types],
					},
					description: Templates.apiDocumentation({
						description: `Checks for the provided \`${aggregationInfo.types[0].types.dtsType}\` in the aggregation ${linkRef} and\n * returns its index if found or -1 otherwise.\n *\n * \n * @returns The index of the provided control in the aggregation if found, or -1 otherwise`,
					}),
					returnValueTypes: [{ dtsType: "int" }],
				});
			} else {
				// This case probably does not exist for web components
				classDef._dts.methods[`set${capitalizedAggregationName}`] = getMethodTemplate({
					params: {
						[aggregationInfo.name]: aggregationInfo.types,
					},
					description: Templates.setAggregationDocumentation({
						getterName: `get${capitalizedAggregationName}`,
						aggregation: aggregationInfo.name,
					}),
				});
			}
		}
		/**
		 * Prepares all necessary components for an association, including import statements, methods, and related information.
		 *
		 * This method assembles the required elements for a specified association, ensuring that the resulting code is comprehensive
		 * and ready for integration into the application.
		 *
		 * @param {string} associationName The name of the association for which the components should be generated.
		 *                                 This name will be used to create the relevant parts, such as import statements
		 *                                 and methods specific to the association.
		 */
		function writeAssociations(associationName) {
			const associationInfo = classDef._dts.associations[associationName];
			// Add default import for aggregations
			writeImports("sap/ui/core/library", "ID");

			associationInfo.types.forEach((type) => {
				if (type.multiple) {
					type.types.forEach(addImportsFromTypes);
				} else {
					addImportsFromTypes(type);
				}
			});
			const multiple = !!associationInfo.types[0].multiple;
			const returnValueTypes = multiple ? [{ multiple, types: [{ dtsType: "ID" }] }] : [{ dtsType: "ID" }];
			const capitalizedAssoiciationName = capitalize(associationInfo.name);
			const linkRef = generateLinkRef(capitalizedAssoiciationName, associationInfo.name);

			// Generate methods
			classDef._dts.methods[`get${capitalizedAssoiciationName}`] = getMethodTemplate({
				description: Templates.apiDocumentation({
					description: `Returns array of IDs of the elements which are the current targets of the association ${linkRef}.`,
				}),
				returnValueTypes,
			});

			if (multiple) {
				const singularName = guessSingularName(associationInfo.name);

				classDef._dts.methods[`add${capitalize(singularName)}`] = getMethodTemplate({
					params: {
						[singularName]: [...associationInfo.types[0].types, { dtsType: "ID" }],
					},
					description: Templates.apiDocumentation({
						description: `Adds some ${associationInfo.name} into the association ${linkRef}.\n *\n * \n * @returns Reference to \`this\` in order to allow method chaining`,
					}),
				});

				classDef._dts.methods[`remove${capitalize(singularName)}`] = getMethodTemplate({
					params: {
						[singularName]: [...associationInfo.types[0].types, { dtsType: "int" }, { dtsType: "ID" }],
					},
					description: Templates.apiDocumentation({
						// TODO a/an depends on the association name ...
						description: `Removes an ${associationInfo.name} from the association named ${linkRef}.\n *\n * \n * @returns The removed ${associationInfo.name} or \`null\``,
					}),
					returnValueTypes: [{ dtsType: "ID" }, { dtsType: "null" }],
				});

				classDef._dts.methods[`removeAll${capitalizedAssoiciationName}`] = getMethodTemplate({
					description: Templates.apiDocumentation({
						description: `Removes all the controls in the association named ${linkRef}.\n *\n * \n * @returns The removed ${associationInfo.name} or \`null\``,
					}),
					returnValueTypes,
				});
			} else {
				// TBC Does this case even exist in the webc world?
				classDef._dts.methods[`set${capitalizedAssoiciationName}`] = getMethodTemplate({
					params: {
						[associationInfo.name]: associationInfo.types,
					},
					// description
				});
			}
		}
		/**
		 * Prepares all necessary components for an event, including import statements, methods, and related information.
		 *
		 * This method assembles the required elements for a specified event, ensuring that the resulting code is comprehensive
		 * and ready for integration into the application.
		 *
		 * @param {string} eventName The name of the event for which the components should be generated.
		 *                           This name will be used to create the relevant parts, such as import statements
		 *                           and methods specific to the event.
		 */
		function writeEvents(eventName) {
			const eventInfo = classDef._dts.events[eventName];
			// Add default import for events
			writeImports("sap/ui/base/Event", "Event");

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

			const capitalizedEventName = capitalize(eventInfo.name);
			const linkRef = generateLinkRef(capitalizedEventName, eventInfo.name);

			// Generate methods
			const detachMutator = getMethodTemplate({
				params: {
					["fnFunction"]: [{ dtsType: `(p1: ${generateEventSettings(classDef.name, eventInfo.name)}) => void` }],
					["oListener"]: [{ dtsType: "object" }],
				},
				description: Templates.apiDocumentation({
					description: `Detaches event handler \`fnFunction\` from the ${linkRef} event of this \`${classDef.name}\`.\n *\n * The passed function and listener object must match the ones used for event registration.\n *\n *\n* @returns Reference to \`this\` in order to allow method chaining`,
				}),
			});
			classDef._dts.methods[`detach${capitalizedEventName}`] = detachMutator;

			// TODO needed twice? with and without oData because it's optional?
			classDef._dts.methods[`attach${capitalizedEventName}`] = getMethodTemplate({
				params: Object.assign(
					{
						oData: [{ dtsType: "object" }],
					},
					detachMutator.params,
				),
				description: Templates.apiDocumentation({
					description: `Attaches event handler \`fnFunction\` to the ${linkRef} event of this \`${classDef.name}\`.\n *\n * When called, the context of the event handler (its \`this\`) will be bound to \`oListener\` if specified,\n * otherwise it will be bound to this \`${classDef.name}\` itself.\n *\n * The event is fired when the user chooses the numeric content.\n *\n *\n* @returns Reference to \`this\` in order to allow method chaining`,
				}),
			});
		}
		function writeMethods(methodName) {
			const methodInfo = classDef._dts.methods[methodName];
			for (const paramName in methodInfo.params) {
				const param = methodInfo.params[paramName];
				param.forEach((type) => {
					if (type.multiple) {
						type.types.forEach(addImportsFromTypes);
					} else {
						addImportsFromTypes(type);
					}
				});
				// param.types.forEach((type) => {
				// 	if (type.multiple) {
				// 		type.types.forEach(addImportsFromTypes);
				// 	} else {
				// 		addImportsFromTypes(type);
				// 	}
				// });
			}
			if (methodInfo.description) {
				methodInfo.description = Templates.apiDocumentation({
					description: methodInfo.description,
				});
			}
		}

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
			if (classDef._dts.implementsMarker.length) {
				classDef._dts.implements = classDef._dts.implementsMarker.map((interfaceDef) => interfaceDef.name);
				for (const interfaceDef of classDef._dts.implementsMarker) {
					writeImports(interfaceDef.package, interfaceDef.name);
				}
			}
			writeImports(superclassSettings.module, superclassSettings.class, { default: true });
			writeImports(superclassSettings.module, `$${superclassSettings.class}Settings`);
			classDef._dts.extends = superclassSettings.class;

			for (const method in classDef._dts.methods) {
				writeMethods(method);
			}
			for (const property in classDef._dts.properties) {
				writeProperties(property);
			}
			for (const aggregation in classDef._dts.aggregations) {
				writeAggregations(aggregation);
			}
			for (const association in classDef._dts.associations) {
				writeAssociations(association);
			}
			for (const event in classDef._dts.events) {
				writeEvents(event);
			}
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
	/**
	 * Updates the Data Type Structure (DTS) information for given entities within the class definition.
	 * This method can be used to move an association to aggregations or to change the type of an event,
	 * among other updates.
	 *
	 * @param {object} classDef - The class definition object. This represents the structure of the class
	 *        where the updates will be applied.
	 *
	 * @param {object} source - The source object containing the entity and its name to be updated.
	 *
	 *        Example:
	 *        ```javascript
	 *        {
	 *            entity: 'property', // e.g., property, aggregation, association, event, method
	 *            name: 'entityName'
	 *        }
	 *        ```
	 *
	 * @param {object} target - The target object specifying the desired changes for the entity. This object
	 *        should include the name of the entity along with any properties that need to be updated.
	 *        Properties of the parameter which do not change are optional. If a property is omitted in the
	 *        target, the property from the source will be used.
	 *
	 *        Example:
	 *        ```javascript
	 *        {
	 *            entity: 'property', // e.g., property, aggregation, association, event, method
	 *            name: 'entityName',
	 *            types: [{
	 *                dtsType: 'string',
	 *                ui5Type: 'string'
	 *            }, ...]
	 *        }
	 *        ```
	 */
	updateDts(classDef, source, target) {
		const targetEntity = target.entity || source.entity;
		const targetName = target.name || source.name;
		classDef._dts[targetEntity][targetName] = classDef._dts[source.entity][source.name];
		classDef._dts[targetEntity][targetName].name = targetName;
		if (target.types) {
			classDef._dts[targetEntity][targetName].types = target.types;
		}
		if (target.entity || target.name) {
			delete classDef._dts[source.entity][source.name];
		}
	},
};

module.exports = DTSSerializer;

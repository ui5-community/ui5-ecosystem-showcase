const prettier = require("prettier");
const { join } = require("path");
const { writeFileSync, existsSync, mkdirSync } = require("fs");

const handlebars = require("handlebars");
const { baseTemplate, loadAndCompile } = require("./HandlebarsHelper");

const SimpleLogger = require("./SimpleLogger");
const logger = SimpleLogger.create("🧑‍💻 DTS");

const WebComponentRegistryHelper = require("./WebComponentRegistryHelper");

const rPlural = /(children|ies|ves|oes|ses|ches|shes|xes|s)$/i;
const mSingular = { children: -3, ies: "y", ves: "f", oes: -2, ses: -2, ches: -2, shes: -2, xes: -2, s: -1 };
const actions = {
	Get: "get",
	Set: "set",
	Add: "add",
	Insert: "insert",
	Remove: "remove",
	RemoveAll: "removeAll",
	Destroy: "destroy",
	IndexOf: "indexOf",
	Attach: "attach",
	Detach: "detach",
};

/**
 * Attempts to convert a plural name to its singular form based on common English rules.
 *
 * @param {string} sName - The plural name to convert
 * @returns {string} The singular form of the name
 */
const guessSingularName = function (sName) {
	return sName.replace(rPlural, function ($, sPlural) {
		const vRepl = mSingular[sPlural.toLowerCase()];
		return typeof vRepl === "string" ? vRepl : sPlural.slice(0, vRepl);
	});
};

const capitalize = (value) => value.replace(/^([a-z])/, (g) => g.toUpperCase());

/**
 * Determines if a word should use "an" instead of "a" as its indefinite article.
 * This function uses a more comprehensive approach that considers common phonetic patterns.
 *
 * @param {string} word - The word to check
 * @returns {boolean} True if the word should use "an", false if it should use "a"
 */
const shouldUseAn = function (word) {
	if (!word || typeof word !== "string") return false;

	// Convert to lowercase for consistent checking
	const lowerWord = word.toLowerCase();

	// Check for vowel sounds at the beginning
	if (/^[aeiou]/i.test(lowerWord)) {
		// Exception for words that start with 'u' but have a 'yu' sound
		if (lowerWord.startsWith("u") && (lowerWord.startsWith("uni") || lowerWord.startsWith("use") || lowerWord.startsWith("uti") || lowerWord.startsWith("eu"))) {
			return false;
		}
		// Exception for words that start with 'o' but have a 'w' sound
		if (lowerWord.startsWith("o") && (lowerWord.startsWith("one") || lowerWord.startsWith("once"))) {
			return false;
		}
		return true;
	}

	// Check for silent 'h' words
	if (lowerWord.startsWith("h") && (lowerWord.startsWith("hour") || lowerWord.startsWith("heir") || lowerWord.startsWith("honor") || lowerWord.startsWith("honest"))) {
		return true;
	}

	return false;
};

/**
 * Generates a standardized documentation for a method or property.
 *
 * @param {object} options - Documentation generation options
 * @param {string} options.entityType - Type of entity (property, aggregation, association, event)
 * @param {string} options.entityName - Name of the entity
 * @param {string} options.action - Action being performed (get, set, add, remove, etc.)
 * @param {string} [options.description] - Description of the entity
 * @param {string} [options.defaultValueDesc] - Default value information
 * @param {string} [options.returnValueDesc] - Description of the return value
 * @param {string} [options.className] - Name of the class containing the entity (for events)
 * @returns {string} Formatted documentation string
 */
const generateStandardDocumentation = function (options) {
	const { entityType, entityName, action, description = "", defaultValueDesc, className = "", typeInfo } = options;

	const linkRef = `{@link #${actions.Get}${capitalize(entityName)} ${entityName}}`;
	let text;
	let defaultValue;
	let returnValue = "@returns Reference to `this` in order to allow method chaining";

	// Determine the appropriate indefinite article
	const article = shouldUseAn(entityName) ? "an" : "a";

	// Generate standard text based on action and entity type
	switch (action) {
		case actions.Get:
			if (entityType === "property") {
				text = `Gets current value of ${entityType} ${linkRef}.`;
				returnValue = `@returns Value of ${entityType} \`${entityName}\``;
			} else if (entityType === "aggregation") {
				text = `Gets content of ${entityType} ${linkRef}.`;
			} else if (entityType === "association") {
				text = `${typeInfo.multiple ? "Returns array of IDs of the elements which are the current targets" : "ID of the element which is the current target"} of the ${entityType} ${linkRef}.`;
				returnValue = `@returns Reference the IDs of the associated controls`;
			}
			returnValue = `@returns The content of the ${entityType}`;
			defaultValue = defaultValueDesc !== undefined ? `Default value is \`${defaultValueDesc}\`.` : "";
			break;
		case actions.Set:
			if (entityType === "property") {
				text = `Sets a new value for ${entityType} ${linkRef}.`;
			} else if (entityType === "aggregation") {
				text = `Sets the aggregated ${linkRef}.`;
			} else if (entityType === "association") {
				text = `Sets the associated ${linkRef}.`;
			}
			defaultValue =
				defaultValueDesc !== undefined
					? `When called with a value of \`null\` or \`undefined\`, the default value of the property will be restored.\n\nDefault value is \`${defaultValueDesc}\`.`
					: "";
			break;
		case actions.Add:
			text = `Adds some ${entityName} to the ${entityType} ${linkRef}.`;
			break;
		case actions.Insert:
			text = `Inserts ${article} ${entityName} into the ${entityType} ${linkRef}.`;
			break;
		case actions.Remove:
			text = `Removes ${article} ${entityName} from the ${entityType} ${linkRef}.`;
			returnValue = `@returns The removed ${entityName} or \`null\``;
			break;
		case actions.RemoveAll:
			text = `Removes all the controls from the ${entityType} ${linkRef}.`;
			returnValue = `@returns An array of the removed elements (might be empty)`;
			break;
		case actions.Destroy:
			text = `Destroys the ${entityName} in the ${entityType} ${linkRef}.`;
			break;
		case actions.IndexOf:
			text = `Checks for the provided '${typeInfo.dedicatedTypes[0].dtsType}' in the ${entityType} ${linkRef} and returns its index if found or -1 otherwise.`;
			returnValue = `@returns The index of the provided control in the ${entityType} if found, or -1 otherwise`;
			break;
		case actions.Attach:
			text = `Attaches event handler \`fnFunction\` to the ${linkRef} event${className ? ` of this \`${className}\`` : ""}.`;
			break;
		case actions.Detach:
			text = `Detaches event handler \`fnFunction\` from the ${linkRef} event${className ? ` of this \`${className}\`` : ""}.`;
			break;
		default:
			text = `Interacts with ${entityType} ${linkRef}.`;
	}

	return baseTemplate({ text, description, defaultValue, returnValue });
};

/**
 * Handlebar Helpers specific to the DTSSerializer.
 */

handlebars.registerHelper("escapeInterfaceName", function (namespace, interfaceName) {
	const ui5QualifiedName = `${namespace}.${interfaceName}`;
	return `__implements_${ui5QualifiedName.replace(/[/.@-]/g, "_")}: boolean;`;
});

handlebars.registerHelper("generateImports", function (module, info) {
	let imports = "import type { ";
	for (const key in info) {
		if (info[key].default) {
			imports += "default as ";
		}
		imports += key;
		if (info[key].alternativeImportName) {
			imports += ` as ${info[key].alternativeImportName}`;
		}
		imports += ", ";
	}
	imports = imports.replace(/,\s$/, ` } from "${module}";`);
	return imports;
});

/**
 * Generates the TypeScript type name for an event's settings.
 *
 * @param {string} className - Name of the class containing the event
 * @param {string} eventName - Name of the event
 * @returns {string} TypeScript type name for the event settings
 */
const generateEventSettings = function (className, eventName) {
	return `${className}$${capitalize(eventName)}Event`;
};
handlebars.registerHelper("generateEventSettings", generateEventSettings);

/**
 * Generates TypeScript type definitions for property settings.
 *
 * @param {Array<Object>} types - Array of type definitions
 * @param {boolean} addSingleAndMulti - Flag whether to add also single
 *                                      type definition in case type is multi
 * @param {Array<Object>} specialTypes - Array of additional fix type definitions
 *
 * @returns {string} TypeScript type definition string
 */
const processTypes = function (types, addSingleAndMulti = false) {
	const typeStrings = new Set();
	const processDedicatedTypes = function (dedicatedTypes) {
		const typeStrings = new Set();
		for (const dedicatedType of dedicatedTypes) {
			typeStrings.add(dedicatedType.dtsType);
			if (dedicatedType.isEnum) {
				typeStrings.add(`keyof typeof ${dedicatedType.dtsType}`);
			}
		}
		return [...typeStrings].join(" | ");
	};

	for (const type of types) {
		const typeString = processDedicatedTypes(type.dedicatedTypes);
		typeStrings.add(type.multiple ? `Array<${typeString}>` : typeString);
		if (type.multiple && addSingleAndMulti) {
			typeStrings.add(typeString);
		}
	}
	return [...typeStrings].join(" | ");
};

handlebars.registerHelper("processTypes", processTypes);
handlebars.registerHelper("generateAggregationSettings", function (types) {
	return processTypes(
		[
			...types,
			{
				dedicatedTypes: [
					{
						dtsType: "AggregationBindingInfo",
					},
					{
						dtsType: "`{${string}}`",
					},
				],
			},
		],
		true,
	);
});
handlebars.registerHelper("generatePropertySettingsWithBindingInfo", function (types) {
	return processTypes([
		...types,
		{
			dedicatedTypes: [
				{
					dtsType: "PropertyBindingInfo",
				},
				{
					dtsType: "`{${string}}`",
				},
			],
		},
	]);
});
handlebars.registerHelper("generateAssociationSettings", function (types) {
	return processTypes(
		[
			...types,
			{
				multiple: types.some((t) => t.multiple),
				dedicatedTypes: [{ dtsType: "string" }],
			},
		],
		true,
	);
});

/**
 * All needed HBS templates for serializing JSDoc comments.
 */
const Templates = {
	module: loadAndCompile("../templates/dts/Module.hbs"),
	class: loadAndCompile("../templates/dts/Class.hbs"),
};

/**
 * The DTSSerializer is responsible for generating TypeScript declaration files (.d.ts)
 * for UI5 web components. It provides methods to initialize classes, write class bodies,
 * and serialize different UI5 elements like properties, aggregations, associations, and events.
 */
const DTSSerializer = {
	/**
	 * Deactivates the *.d.ts file generation via ui5.yaml configuration.
	 * When called, all methods in this object will be replaced with no-op functions.
	 */
	deactivate() {
		for (const s in this) {
			this[s] = () => {};
		}
	},

	/**
	 * Serializes a full set of *.d.ts files for each class/enum/interface in this registry entry.
	 * Location: ".ui5-tooling-modules/types"
	 * @param {WebComponentRegistry.Entry} registryEntry the registry entry which will receive a set of serialized *.d.ts files.
	 */
	prepare: function (registryEntry) {
		const cachePath = join(process.cwd(), ".ui5-tooling-modules");

		if (!existsSync(join(cachePath, "types"))) {
			// Directory does not exist, create it
			mkdirSync(join(cachePath, "types"), { recursive: true });
		}

		prettier
			.format(
				Templates.module({
					registryEntry,
				}),
				{
					// TODO: read from prettier config if existing
					//       otherwise use some defaults
					semi: true,
					trailingComma: "none",
					parser: "typescript",
				},
			)
			.then((prettifiedTypes) => {
				if (prettifiedTypes) {
					writeFileSync(join(cachePath, "types", `${registryEntry.qualifiedNamespace}.gen.d.ts`), prettifiedTypes, { encoding: "utf-8" });
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
						{
							// TODO: read from prettier config if existing
							//       otherwise use some defaults
							semi: true,
							trailingComma: "none",
							parser: "typescript",
						},
					)
					.then((prettifiedTypes) => {
						if (prettifiedTypes) {
							writeFileSync(join(cachePath, "types", `${registryEntry.qualifiedNamespace}.dist.${clazz}.gen.d.ts`), prettifiedTypes, { encoding: "utf-8" });
						}
					});
			}
		}
	},

	/**
	 * Initializes the internal objects holding the DTS information for the given class.
	 * Will be filled on the go when the custom elements metadata is analyzed.
	 * @param {WebComponentRegistry.ClassDef} classDef the class def to be initialized
	 */
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

	/**
	 * Writes the main class body DTS information, e.g. properties, aggregations, ...
	 * @param {WebComponentRegistry.ClassDef} classDef the class def for which the main class body should be written
	 */
	writeClassBody(classDef) {
		// Common utility functions
		/**
		 * Creates a template for method documentation.
		 *
		 * @param {object} options - Method template options
		 * @param {object} [options.methodName] - Name of the method
		 * @param {object} [options.params] - Method parameters
		 * @param {string} [options.description] - Method description
		 * @param {Array<object>} [options.returnValueTypes] - Return value types
		 * @returns {object} Method template object
		 */
		const getMethodTemplate = function ({ methodName = "", params = {}, description = "", returnValueTypes = [{ dedicatedTypes: [{ dtsType: "this" }] }] } = {}) {
			return {
				methodName,
				params,
				description,
				returnValueTypes,
			};
		};

		/**
		 * Prepares all necessary information to later generate the correct import statements for a given class.
		 *
		 * @param {string} importSource The path to the module from which the import should be loaded.
		 * @param {string} namedImport The name of the export as well as the variable name to be used for the import.
		 * @param {object} importOptions An object containing additional import configurations.
		 */
		function writeImports(importSource, namedImport, importOptions) {
			classDef._dts[importOptions?.global ? "globalImports" : "imports"][importSource] ??= {};
			classDef._dts[importOptions?.global ? "globalImports" : "imports"][importSource][namedImport] = Object.assign({}, importOptions);
		}

		/**
		 * Processes types and adds necessary imports
		 *
		 * @param {Array<object>} types - Array of type objects
		 */
		const processTypesAndAddImports = (types) => {
			types.forEach((type) => {
				type.dedicatedTypes.forEach((type) => {
					// Adds import statements for types that are from external packages.
					if (type.packageName && type.dtsType !== classDef.name) {
						writeImports(type.packageName, type.dtsType, { default: type.isClass, global: type.globalImport });
					}
				});
			});
		};

		/**
		 * Creates a method with standard documentation
		 *
		 * @param {string} methodName - Name of the method to create
		 * @param {object} options - Options for method creation
		 * @param {object} [options.params] - Method parameters
		 * @param {object} docOptions - Documentation options
		 * @param {Array<object>} [returnValueTypes] - Return value types
		 */
		const createMethod = (options) => {
			const { methodSuffix = "", params = {}, docOptions, returnValueTypes } = options;
			let methodName = docOptions.action;
			if ([actions.Set, actions.Get, actions.RemoveAll, actions.Destroy, actions.Detach, actions.Attach].includes(docOptions.action)) {
				methodName += capitalize(docOptions.entityName);
			} else if ([actions.Add, actions.Insert, actions.Remove, actions.IndexOf].includes(docOptions.action)) {
				methodName += capitalize(guessSingularName(docOptions.entityName));
			}
			classDef._dts.methods[`${methodName}${methodSuffix}`] = getMethodTemplate({
				methodName,
				params,
				description: generateStandardDocumentation(docOptions),
				returnValueTypes,
			});
		};

		/**
		 * Creates methods for multiple items (for aggregations and associations)
		 *
		 * @param {object} info - Entity information
		 * @param {string} entityType - Type of entity (aggregation or association)
		 * @param {Array<object>} returnValueTypes - Return value types for removeAll method
		 */
		const createMultipleItemMethods = (info, entityType, returnValueTypes) => {
			const singularName = guessSingularName(info.name);
			// Add method
			createMethod({
				params: {
					[singularName]: {
						types: entityType === "association" ? [...info.types, { dedicatedTypes: [{ dtsType: "ID" }] }] : info.types,
					},
				},
				docOptions: {
					entityType,
					entityName: info.name,
					action: actions.Add,
				},
			});

			// Insert method (only for aggregations)
			if (entityType === "aggregation") {
				createMethod({
					params: {
						[singularName]: {
							types: info.types,
						},
						["index"]: {
							types: [
								{
									dedicatedTypes: [
										{
											dtsType: "int",
										},
									],
								},
							],
						},
					},
					docOptions: {
						entityType,
						entityName: info.name,
						action: actions.Insert,
					},
				});
			}

			// Remove method
			createMethod({
				params: {
					[singularName]: {
						types: [
							...info.types,
							{
								dedicatedTypes: [
									{
										dtsType: "int",
									},
								],
							},
							{
								dedicatedTypes: [
									{
										dtsType: "ID",
									},
								],
							},
						],
					},
				},
				docOptions: {
					entityType,
					entityName: info.name,
					action: actions.Remove,
				},
				returnValueTypes: [
					...(entityType === "association"
						? [
								{
									dedicatedTypes: [
										{
											dtsType: "ID",
										},
									],
								},
							]
						: [...info.types]),
					{
						dedicatedTypes: [
							{
								dtsType: "null",
							},
						],
					},
				],
			});

			// RemoveAll method
			createMethod({
				docOptions: {
					entityType,
					entityName: info.name,
					action: actions.RemoveAll,
					description: entityType === "aggregation" ? `Additionally, it unregisters them from the hosting UIArea.` : undefined,
				},
				returnValueTypes,
			});

			// IndexOf method (only for aggregations)
			if (entityType === "aggregation") {
				createMethod({
					params: {
						[singularName]: {
							types: [...info.types],
						},
					},
					docOptions: {
						entityType,
						entityName: info.name,
						action: actions.IndexOf,
						typeInfo: info.types[0],
					},
					returnValueTypes: [
						{
							dedicatedTypes: [
								{
									dtsType: "int",
								},
							],
						},
					],
				});
			}
		};

		/**
		 * Generates all necessary components for a property
		 *
		 * @param {string} propertyName - The name of the property
		 */
		function writeProperties(propertyName) {
			const propertyInfo = classDef._dts.properties[propertyName];
			propertyInfo.needsBindingString = !propertyInfo.readonly;

			processTypesAndAddImports(propertyInfo.types);

			// properties of type "string" don't need the binding string syntax `{${string}}`
			propertyInfo.types.forEach((type) => {
				if (type.dtsType === "string") {
					propertyInfo.needsBindingString = false;
				}
			});

			// Generate getter method
			createMethod({
				docOptions: {
					entityType: "property",
					entityName: propertyInfo.name,
					action: actions.Get,
					description: propertyInfo.description,
					defaultValueDesc: propertyInfo.defaultValue,
				},
				returnValueTypes: propertyInfo.types,
			});

			if (propertyInfo.readonly) {
				delete classDef._dts.properties[propertyName];
			} else {
				// Add default import for properties
				writeImports("sap/ui/base/ManagedObject", "PropertyBindingInfo");

				// Generate setter method
				createMethod({
					params: {
						[propertyInfo.name]: {
							types: [
								...propertyInfo.types,
								{
									dedicatedTypes: [
										{
											dtsType: "null",
										},
									],
								},
							],
							optional: propertyInfo.defaultValue !== undefined,
						},
					},
					docOptions: {
						entityType: "property",
						entityName: propertyInfo.name,
						action: actions.Set,
						description: propertyInfo.description,
						defaultValueDesc: propertyInfo.defaultValue,
					},
				});
			}
		}

		/**
		 * Generates all necessary components for an aggregation
		 *
		 * @param {string} aggregationName - The name of the aggregation
		 */
		function writeAggregations(aggregationName) {
			const aggregationInfo = classDef._dts.aggregations[aggregationName];

			// Add default imports
			writeImports("sap/ui/base/ManagedObject", "AggregationBindingInfo");
			writeImports("sap/ui/core/library", "ID");

			// Process types and add imports
			processTypesAndAddImports(aggregationInfo.types);

			const multiple = !!aggregationInfo.types[0].multiple;

			// Generate getter method
			createMethod({
				docOptions: {
					entityType: "aggregation",
					entityName: aggregationInfo.name,
					action: actions.Get,
					description: aggregationInfo.description,
				},
				returnValueTypes: aggregationInfo.types,
			});

			// Generate destroy method
			createMethod({
				docOptions: {
					entityType: "aggregation",
					entityName: aggregationInfo.name,
					action: actions.Destroy,
				},
			});

			if (multiple) {
				// Create methods for multiple items
				createMultipleItemMethods(aggregationInfo, "aggregation", aggregationInfo.types);
			} else {
				logger.error(`Aggregation '${aggregationInfo.name}' of web component '${classDef.name}' accepts only a single control. This should not be the case and should be checked.`);
			}
		}

		/**
		 * Generates all necessary components for an association
		 *
		 * @param {string} associationName - The name of the association
		 */
		function writeAssociations(associationName) {
			const associationInfo = classDef._dts.associations[associationName];

			// Add default import
			writeImports("sap/ui/core/library", "ID");

			// Process types and add imports
			processTypesAndAddImports(associationInfo.types);

			const multiple = !!associationInfo.types[0].multiple;
			const returnValueTypes = [
				{
					multiple,
					dedicatedTypes: [
						{
							dtsType: "ID",
						},
					],
				},
			];

			// Generate getter method
			createMethod({
				docOptions: {
					entityType: "association",
					entityName: associationInfo.name,
					action: actions.Get,
					typeInfo: associationInfo.types[0],
				},
				returnValueTypes,
			});

			if (multiple) {
				// Create methods for multiple items
				createMultipleItemMethods(associationInfo, "association", returnValueTypes);
			} else {
				// Generate setter method for single association
				createMethod({
					params: {
						[associationInfo.name]: {
							types: associationInfo.types,
						},
					},
					docOptions: {
						entityType: "association",
						entityName: associationInfo.name,
						action: actions.Set,
					},
				});
			}
		}

		/**
		 * Generates all necessary components for an event
		 *
		 * @param {string} eventName - The name of the event
		 */
		function writeEvents(eventName) {
			const eventInfo = classDef._dts.events[eventName];

			// Add default import for events
			writeImports("sap/ui/base/Event", "Event", { default: true });

			// Process event parameters and add imports
			for (const paramName in eventInfo.parameters) {
				processTypesAndAddImports(eventInfo.parameters[paramName].types);
			}

			// Create common parameters for event methods
			const detachParams = {
				["fnFunction"]: {
					types: [
						{
							dedicatedTypes: [
								{
									dtsType: `(p1: ${generateEventSettings(classDef.name, eventInfo.name)}) => void`,
								},
							],
						},
					],
					description: "The function to be called when the event occurs",
				},
				["oListener"]: {
					types: [
						{
							dedicatedTypes: [
								{
									dtsType: "object",
								},
							],
						},
					],
					description: `Context object to call the event handler with. Defaults to this ${classDef.name} itself`,
					optional: true,
				},
			};

			// Generate detach method
			createMethod({
				params: detachParams,
				docOptions: {
					entityType: "event",
					entityName: eventInfo.name,
					action: actions.Detach,
					description: "The passed function and listener object must match the ones used for event registration.",
					className: classDef.name,
				},
			});

			// Generate attach method
			createMethod({
				params: Object.assign({}, detachParams),
				docOptions: {
					entityType: "event",
					entityName: eventInfo.name,
					action: actions.Attach,
					description: `When called, the context of the event handler (its \`this\`) will be bound to \`oListener\` if specified,\n * otherwise it will be bound to this \`${classDef.name}\` itself.`,
					className: classDef.name,
				},
			});

			// Generate attach method
			createMethod({
				methodSuffix: "WithOptionalOdata",
				params: Object.assign(
					{
						["oData"]: {
							types: [
								{
									dedicatedTypes: [
										{
											dtsType: "object",
										},
									],
								},
							],
							description: "An application-specific payload object that will be passed to the event handler along with the event object when firing the event",
						},
					},
					detachParams,
				),
				docOptions: {
					entityType: "event",
					entityName: eventInfo.name,
					action: actions.Attach,
					description: `When called, the context of the event handler (its \`this\`) will be bound to \`oListener\` if specified,\n * otherwise it will be bound to this \`${classDef.name}\` itself.`,
					className: classDef.name,
				},
			});
		}

		/**
		 * Processes method information, adding imports and formatting descriptions
		 *
		 * @param {string} methodName - The name of the method to process
		 */
		function writeMethods(methodName) {
			const methodInfo = classDef._dts.methods[methodName];
			methodInfo.methodName = methodInfo.name;

			// Process parameter types and add imports
			for (const paramName in methodInfo.params) {
				processTypesAndAddImports(methodInfo.params[paramName].types);
			}

			// Format description if present
			if (methodInfo.description) {
				methodInfo.description = baseTemplate({
					description: methodInfo.description,
				});
			}
		}

		// Main execution flow
		if (classDef.superclass) {
			// Set up superclass information
			let superclassSettings;
			if (WebComponentRegistryHelper.isUI5Element(classDef.superclass) || WebComponentRegistryHelper.isWebComponent(classDef.superclass)) {
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

			// Handle implements
			classDef._dts.implementsMarker = classDef._ui5implements.filter((interface) => !classDef._unkownInterfaces.has(interface.name));
			if (classDef._dts.implementsMarker.length) {
				classDef._dts.implements = classDef._dts.implementsMarker.map((interfaceDef) => interfaceDef.name);
				for (const interfaceDef of classDef._dts.implementsMarker) {
					let importOptions;
					if (interfaceDef.name === classDef.name) {
						importOptions = {
							alternativeImportName: `${interfaceDef.package.replace(/\//g, "_")}_${interfaceDef.name}`,
						};
						classDef._dts.implements = [importOptions.alternativeImportName];
					}
					writeImports(interfaceDef.package, interfaceDef.name, importOptions);
				}
			}

			// Add superclass imports
			writeImports(superclassSettings.module, superclassSettings.class, { default: true });
			writeImports(superclassSettings.module, `$${superclassSettings.class}Settings`);
			classDef._dts.extends = superclassSettings.class;

			// Process all entity types
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

	/**
	 * Generically collects DTS information for the given class and entity, e.g. classDef = Button, entityType = "properties", entityDef = {...}
	 * @param {WebComponentRegistry.ClassDef} classDef
	 * @param {string} entityType the type of entity that should be written, e.g. "properties", "aggregations", ...
	 * @param {object} entityDef the entity definition, e.g. property or aggregation info
	 */
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

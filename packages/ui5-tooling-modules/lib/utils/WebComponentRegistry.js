const JSDocSerializer = require("./JSDocSerializer");
const DTSSerializer = require("./DTSSerializer");
const WebComponentRegistryHelper = require("./WebComponentRegistryHelper");

// List of all supported primitive types including "integer"
const primitiveTypes = ["object", "boolean", "number", "integer", "bigint", "string", "null"];
// Known native browser elemts used as types in web components
const nativeBrowserElements = ["DataTransfer", "Date", "Event", "File", "FileList"];
/**
 * Camelize the dashes.
 * Used to transform event names.
 * @param {string} str the string to camelize
 * @returns {string} the camelized string
 */
const camelize = (str) => {
	return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Converts slashes in a string to dots.
 * @param {string} s the slahed string
 * @returns {string} the dotted string
 */
function slash2dot(s) {
	return s?.replace(/\//g, ".");
}

/**
 * Calculates the name for the UI5 level getter function based on the web components native function name.
 * @param {string} functionName the name of the web components native function
 * @returns the generated UI5 getter function name
 */
const calculateGetterName = (functionName) => {
	return "get" + functionName.substring(0, 1).toUpperCase() + functionName.substring(1);
};

// the class name of the base class of all control wrappers
// corresponds to the "sap.ui.core.webc.WebComponent" class at runtime.
const UI5_ELEMENT_CLASS_NAME = "UI5Element";

let _registry = {};

let _classAliases = {};

// TODO: Make "classes" into... a class :)
//       Get's rid of passing the "classDef" and the "ui5metadata" around.
class RegistryEntry {
	#customElementsMetadata = {};

	constructor({ customElementsMetadata, namespace, scopeSuffix, npmPackagePath, version }) {
		this.#customElementsMetadata = customElementsMetadata;
		this.namespace = namespace;
		this.scopeSuffix = scopeSuffix;
		this.npmPackagePath = npmPackagePath;
		this.qualifiedNamespace = slash2dot(this.namespace);
		//this.moduleBasePath = moduleBasePath;
		//this.qualifiedNamespace = `${moduleBasePath ? slash2dot(this.moduleBasePath) + "." : ""}${slash2dot(removeScopePrefix ? this.namespace.replace(/^@/, "") : this.namespace)}`;
		// TODO: The following conversion of "-" to "_" is a workaround for testing the UI5 JSDoc build.
		//       Only needed until we solve the escaping issue of segments like "@ui5" or "webcomponents-fiori".
		// this.qualifiedNamespace = this.qualifiedNamespace.replace(/-/g, "_");
		this.version = version;

		this.customElements = {};
		this.classes = {};
		this.enums = {};
		this.interfaces = {};

		this.#processMetadata();

		JSDocSerializer.prepare(this);

		DTSSerializer.prepare(this);

		console.log(`Metadata processed for package ${namespace}.`); // Module base path: ${moduleBasePath}.`);
	}

	#deriveUi5ClassNames(classDef) {
		// Calculate fully qualified class name based on the module name from the custom elements manifest
		// e.g. dist/Avatar.js -> dist.Avatar
		let convertedClassName = classDef.module.replace(/\//g, ".");
		convertedClassName = convertedClassName.replace(/\.js$/, "");
		classDef._derivedUi5ClassName = convertedClassName;

		classDef._ui5QualifiedName = `${this.qualifiedNamespace}.${classDef._derivedUi5ClassName}`;

		// TODO: Ideally not needed in the future once we have a solution for escaping in the UI5 JDSDoc build
		//       Also remember to remove the "@ui5-module-override" directives in the HBS templates!
		classDef._ui5QualifiedNameSlashes = classDef._ui5QualifiedName.replace(/\./g, "/");
	}

	#processMetadata() {
		// [1] parsing the metadata
		this.#customElementsMetadata.modules?.forEach((module) => {
			module.declarations?.forEach(this.#parseDeclaration.bind(this));
			module.exports?.forEach(this.#parseExports.bind(this));
		});

		// [2] prepare enum objects
		this.#prepareEnums();

		// [3] prepare interface definitions
		this.#prepareInterfaces();

		// [4] Prepare classes
		Object.keys(this.classes).forEach((className) => {
			const classDef = this.classes[className];

			classDef._ui5implements ??= [];

			this.#deriveUi5ClassNames(classDef);

			this.#connectSuperclass(classDef);

			this.#calculateScopedTagName(classDef);
		});

		// [5] create UI5 metadata for each classed based on the parsed custom elements metadata
		//     Note: The order is important! We connected the superclasses first and only then create its metadata.
		//           We need a fully constructed parent chain later for ensuring UI5 defaults (refer to #ensureDefaults)
		Object.keys(this.classes).forEach((className) => {
			const classDef = this.classes[className];
			this.#initClass(classDef);
			// TODO: We should not create metadata for classes without a superclass.
			//if (classDef.superclass) {
			this.#createUI5Metadata(classDef);
			//}
		});
	}

	#parseDeclaration(decl) {
		switch (decl.kind) {
			case "class":
				this.classes[decl.name] = decl;
				break;
			case "enum":
				this.enums[decl.name] = decl;
				break;
			case "interface":
				this.interfaces[decl.name] = decl;
				break;
			default:
				console.error("unknown declaration kind:", decl.kind);
		}
	}

	#parseExports(exp) {
		const exportName = exp.declaration.name;

		// try to identify class for the custom element
		const correspondingClass = this.classes[exportName];

		if (correspondingClass) {
			// find module name
			correspondingClass.module = exp.declaration?.module;
			// we track both npm-package name and the namespace
			// they are identical for now, might change later
			correspondingClass.namespace = correspondingClass.package = this.namespace;
		}

		if (exp.kind === "custom-element-definition") {
			this.customElements[exportName] = correspondingClass || {};
		}
	}

	#connectSuperclass(classDef) {
		if (classDef.superclass?.name?.includes(".")) {
			const superclassName = classDef.superclass.name;
			const [npmPackage, ...nameParts] = superclassName.split(".");
			classDef.superclass = {
				name: nameParts.join("."),
				_ui5QualifiedName: nameParts.join("."), // TODO: what is this?
				package: npmPackage,
				file: `dist/${nameParts.join("/")}.js`,
			};
			console.warn(`The class '${this.namespace}/${classDef.name}' detected superclass '${classDef.superclass.package}/${classDef.superclass.name}' from string '${superclassName}'!`);
		}
		if (classDef.superclass) {
			const superclassName = classDef.superclass.name;
			// determine superclass cross-package
			const refPackage = WebComponentRegistry.getPackage(classDef.superclass.package);

			let superclassRef = (refPackage || this).classes[superclassName];
			if (!superclassRef) {
				console.error(
					`The class '${this.namespace}/${classDef.name}' has an unknown superclass '${classDef.superclass.package}/${superclassName}' using default '@ui5/webcomponents-base/UI5Element'!`,
				);
				const refPackage = WebComponentRegistry.getPackage("@ui5/webcomponents-base");
				let superclassRef = (refPackage || this).classes[UI5_ELEMENT_CLASS_NAME];
				classDef.superclass = superclassRef;
			} else {
				this.#connectSuperclass(superclassRef);
				classDef.superclass = superclassRef;
			}
		}
	}

	prefixns(str) {
		return `${this.qualifiedNamespace}.${str}`;
	}

	prefixnsAsModule(str) {
		// a named export is referenced with a dot, e.g. "module:@ui5/webcomponents.IAvatarGroupItem"
		return `module:${this.namespace}.${str}`;
	}

	#calculateScopedTagName(classDef) {
		// only scope UI5Element subclasses
		if (this.scopeSuffix && WebComponentRegistryHelper.isUI5ElementSubclass(classDef)) {
			if (classDef.tagName) {
				classDef.scopedTagName = `${classDef.tagName}-${this.scopeSuffix}`;
			}
		}
	}

	// --- UI5 Metadata transformer below ---

	#normalizeType(type) {
		if (type) {
			const lowerCaseName = type.toLowerCase();
			if (lowerCaseName === "number") {
				return "float";
			} else if (lowerCaseName === "integer") {
				return "int";
			}
			return lowerCaseName;
		}
		return "string";
	}

	#parseComplexType(type, packageRef) {
		const base = {
			dtsType: type,
			ui5Type: packageRef.prefixns(type),
			moduleType: packageRef.prefixnsAsModule(type),
			packageName: packageRef.namespace,
		};
		if (packageRef.interfaces[type]) {
			return {
				...base,
				isInterface: true,
			};
		} else if (packageRef.enums[type]) {
			return {
				...base,
				isEnum: true,
			};
		} else if (packageRef.classes[type]) {
			const classDef = packageRef.classes[type];
			return {
				...base,
				ui5Type: classDef._ui5QualifiedName,
				moduleType: `module:${classDef._ui5QualifiedNameSlashes}`,
				packageName: classDef._ui5QualifiedNameSlashes,
				isClass: true,
			};
		}
	}
	#extractUi5Type(typeInfo) {
		const deriveType = (type) => {
			if (type === "undefined") {
				return;
			}
			// [Complex types]:
			// we have a reference to other things -> enums, interfaces, classes
			if (typeInfo?.references?.length > 0 || this.classes[type] || this.enums[type] || this.interfaces[type]) {
				// Since the UI5 runtime only allows for 1 single type per property/aggregation, we take the first reference
				type = typeInfo?.references?.[0]?.name || type;

				if (type === "ValueState" && typeInfo.references?.[0].package === "@ui5/webcomponents-base") {
					// case 1a: native webc ValueState ==> core ValueState
					return {
						dtsType: "ValueState",
						packageName: "sap/ui/core/library",
						moduleType: "module:sap/ui/core/ValueState",
						ui5Type: "sap.ui.core.ValueState",
						isEnum: true,
					};
				}
				// case 1b: complex type is enum, interface or class
				let complexType = this.#parseComplexType(type, this);
				if (!complexType && this.namespace !== typeInfo.references[0].package) {
					// case 1c: check for cross package type reference
					const refPackage = WebComponentRegistry.getPackage(typeInfo.references[0].package);
					if (refPackage) {
						complexType = this.#parseComplexType(type, refPackage);
					} else {
						console.log(`Reference package '${typeInfo.references[0].package}' for complex type '${type}' not found`);
					}
				} else if (!complexType && typeInfo.references[0]) {
					// case 1d: not able to find the type but there is a reference ==> try to import original webc type from the importing module itself
					const refClass = this.classes[typeInfo.references[0].module.match(/\/(.*).js$/)?.[1]];
					if (refClass) {
						return {
							dtsType: type,
							ui5Type: "any",
							packageName: refClass._ui5QualifiedNameSlashes,
							globalImport: true,
						};
					}
				}

				if (!complexType) {
					typeDef.isUnclear = true;
				}
				return (
					complexType || {
						// case 2: Couldn't determine type => fallback to any
						isUnclear: true,
						dtsType: "any",
						ui5Type: "any",
					}
				);
			} else if (type === "HTMLElement" || type === "Node") {
				// case 3: HTMLElement || Node => sap/ui/core/Control
				return {
					dtsType: "Control",
					packageName: "sap/ui/core/Control",
					moduleType: "module:sap/ui/core/Control",
					ui5Type: "sap.ui.core.Control",
					isClass: true,
				};
			} else if (primitiveTypes.includes(type.toLowerCase())) {
				// case 4: primitive types
				return {
					dtsType: this.#normalizeType(type),
					ui5Type: this.#normalizeType(type),
				};
			} else if (nativeBrowserElements.includes(type)) {
				// case 5: native browser elements
				return {
					dtsType: type,
					ui5Type: "object",
				};
			} else {
				typeDef.isUnclear = true;
				// case 6: Unclear
				return {
					isUnclear: true,
					dtsType: "any",
					ui5Type: "any",
				};
			}
		};
		const typeDef = {
			origType: typeInfo?.text,
			types: [],
		};

		const types = typeInfo?.text?.match(/(?:Array<[^>]*>|[^|])+/g) || [];

		for (let name of types) {
			name = name.trim();
			const arrayTypeMatch = name.match(/Array<(.*)>/i);
			const multiple = !!arrayTypeMatch;

			if (multiple) {
				typeDef.types.push({
					origType: arrayTypeMatch[1],
					multiple,
					types: arrayTypeMatch[1]
						.split("|")
						.map((s) => deriveType(s.trim()))
						.filter((t) => !!t),
				});
			} else {
				typeDef.types.push(deriveType(name));
			}

			// unpack UI5 type
			// as UI5 can onbly handle one type (unlike TS)
			typeDef.ui5TypeInfo ??= Object.assign({ multiple }, typeDef.types[0]);
			if (typeDef.ui5TypeInfo.types?.length >= 1) {
				Object.assign(typeDef.ui5TypeInfo, typeDef.ui5TypeInfo.types[0]);
			}
		}
		typeDef.types = typeDef.types.filter((t) => !!t);
		return typeDef;
	}

	#castDefaultValue(defaultValue, ui5TypeInfo) {
		if (defaultValue === "undefined") {
			return undefined;
		}

		switch (ui5TypeInfo.ui5Type) {
			case "float":
				return parseFloat(defaultValue);
			case "boolean":
				return /true/.test(defaultValue);
			case "object":
				return JSON.parse(defaultValue);
			default:
				return defaultValue;
		}
	}

	/**
	 * Checks the given property definition object for a special UI5 mapping.
	 * The specific formatter are implemented in "sap.ui.core.webc.WebComponent".
	 *
	 * @param {object} propDef the property definition object from the custom elements metadata
	 * @param {object} ui5metadata the UI5 metadata object
	 * @returns {boolean} whether the property needs a special mapping
	 */
	#checkForSpecialMapping(classDef, propDef, ui5metadata) {
		if (propDef.name === "accessibleNameRef") {
			ui5metadata.associations["ariaLabelledBy"] = {
				type: "sap.ui.core.Control",
				multiple: true,
				mapping: {
					type: "property",
					to: "accessibleNameRef",
					formatter: "_getAriaLabelledByForRendering",
				},
			};
			// Since we change the naming from "accessibleNameRef" to "ariaLabelledBy", we can't pass the propDef directly to the JSDocSerializer!
			JSDocSerializer.writeDoc(classDef, "associations", { name: "ariaLabelledBy", description: propDef.description });
			DTSSerializer.writeDts(classDef, "associations", {
				name: "ariaLabelledBy",
				description: propDef.description.replace(/\n/g, "\n * "),
				types: [
					{
						origType: "Array<HTMLElement>",
						multiple: true,
						types: [
							{
								dtsType: "Control",
								packageName: "sap/ui/core/Control",
								moduleType: "module:sap/ui/core/Control",
								ui5Type: "sap.ui.core.Control",
								isClass: true,
							},
						],
					},
				],
			});
			return true;
		} else if (propDef.name === "disabled") {
			// "disabled" maps to "enabled" in UI5
			// we also need the UI5 EnabledPropagator
			classDef._ui5specifics.needsEnabledPropagator = true;
			ui5metadata.properties["enabled"] = {
				type: "boolean",
				defaultValue: "true",
				mapping: {
					type: "property",
					to: "disabled",
					formatter: "_mapEnabled",
				},
			};
			// Since we flip the naming from "disabled" to "enabled", we can't pass the propDef directly to the JSDocSerializer!
			JSDocSerializer.writeDoc(classDef, "properties", { name: "enabled", description: propDef.description });
			DTSSerializer.writeDts(classDef, "properties", {
				name: "enabled",
				description: propDef.description.replace(/\n/g, "\n * "),
				types: [
					{
						dtsType: "boolean",
					},
				],
				defaultValue: "true",
			});

			return true;
		}

		return false;
	}

	#processMembers(classDef, ui5metadata, propDef) {
		// field -> property or association
		if (propDef.kind === "field") {
			const typeDef = this.#extractUi5Type(propDef.type);
			const isAssociation = typeDef.origType === "HTMLElement | string | undefined";

			// Some properties might need a special UI5 mapping, e.g. "accesibleNameRef"
			const hasSpecialMapping = this.#checkForSpecialMapping(classDef, propDef, ui5metadata);
			if (hasSpecialMapping) {
				return;
			}

			// DEBUG
			if (typeDef.isUnclear) {
				console.warn(
					`[unclear type 🤔] ${classDef.name} - ${isAssociation ? "association" : "property"} '${propDef.name}' has unclear type '${typeDef.origType}' -> defaulting to 'any', multiple: ${typeDef.ui5TypeInfo.multiple}`,
				);
			}

			// If any property of a class is a form relevant property, the UI5 control class must implement the "sap.ui.core.IFormContent" interface
			classDef._ui5implementsFormContent ??= propDef._ui5formProperty;

			if (propDef.readonly) {
				// calculated readonly fields -> UI5's WebComponentsMetadata class will generate getters
				// e.g. AvatarGroup#getColorScheme
				ui5metadata.getters.push(propDef.name);

				// jsdoc must contain the generated name at UI5 runtime
				JSDocSerializer.writeDoc(classDef, "getters", {
					name: propDef.name,
					getterName: calculateGetterName(propDef.name),
					description: propDef.description,
				});

				DTSSerializer.writeDts(classDef, "properties", {
					name: propDef.name,
					description: propDef.description.replace(/\n/g, "\n * "),
					types: typeDef.types,
					readonly: true,
				});
			} else if (isAssociation) {
				ui5metadata.associations[propDef.name] = {
					type: typeDef.ui5TypeInfo.ui5Type,
					mapping: {
						type: "property", // assoc. are always property mappings
						to: propDef.name, // the name of the webc's attribute
					},
				};
				JSDocSerializer.writeDoc(classDef, "associations", propDef);
				DTSSerializer.writeDts(classDef, "associations", {
					name: propDef.name,
					description: propDef.description.replace(/\n/g, "\n * "),
					types: typeDef.types,
				});
			} else {
				if (typeDef.ui5TypeInfo.isClass || typeDef.ui5TypeInfo.isInterface) {
					console.warn(`[interface or class type given for property] ${classDef.name} - property ${propDef.name}`);
				}
				let defaultValue = propDef.default;
				if (defaultValue) {
					// TODO: Why are the default value strings escaped?
					if (typeof defaultValue === "string") {
						defaultValue = defaultValue.replace(/"/g, "");
					}

					defaultValue = this.#castDefaultValue(defaultValue, typeDef.ui5TypeInfo);
				}
				let mapping = "property";
				if (typeDef.ui5TypeInfo.ui5Type === "sap.ui.core.ValueState") {
					// the UI5 valueState needs the Core's enum typing and some special mapping to
					// convert the "sap.ui.core.ValueState" to the web component's variant.
					mapping = {
						formatter: "_mapValueState",
						parser: "_parseValueState",
					};
				}

				ui5metadata.properties[propDef.name] = {
					type: `${typeDef.ui5TypeInfo.ui5Type}${typeDef.ui5TypeInfo.multiple ? "[]" : ""}`,
					mapping,
					defaultValue: defaultValue,
				};
				JSDocSerializer.writeDoc(classDef, "properties", {
					name: propDef.name,
					description: propDef.description,
					moduleType: typeDef.ui5TypeInfo?.moduleType,
				});

				DTSSerializer.writeDts(classDef, "properties", {
					name: propDef.name,
					description: propDef.description?.replace(/\n/g, "\n * "),
					types: typeDef.types,
					defaultValue: defaultValue,
				});
			}
		} else if (propDef.kind === "method") {
			// Methods are proxied through the core.WebComponent base class
			// e.g. DatePicker#isValid or Toolbar#isOverflowOpen
			ui5metadata.methods.push(propDef.name);

			// method have parameters (unlike getters)
			const { parsedParams, jsDocParams } = this.#parseMethodParameters(classDef, propDef);
			JSDocSerializer.writeDoc(classDef, "methods", {
				name: propDef.name,
				description: propDef.description,
				parameters: jsDocParams,
			});
			DTSSerializer.writeDts(classDef, "methods", {
				name: propDef.name,
				description: propDef.description?.replace(/\n/g, "\n * "),
				params: parsedParams,
			});
		}
	}

	#processSlots(classDef, ui5metadata, slotDef) {
		let aggregationName = slotDef.name;
		let slotName = slotDef.name;
		let aggregationType;

		// web component allows text node content
		// TODO: How to figure this out "natively" without "_ui5propertyName"?
		//       A text content must become mapped to the "text" ui5 property.
		//       Or: What if the XMLTP learns to parse text nodes correctly for WebComponent subclasses
		//           -> we could move the text-node content into the "text" property of the UI5 wrapper.
		if (slotDef._ui5propertyName === "text") {
			console.log(`[text-node slot]: ${classDef.name} - slot '${slotName}' allows text content`);
			// nothing to do for now, we enforced a ui5 property named "text" later
			return;
		}

		const typeDef = this.#extractUi5Type(slotDef._ui5type);
		if (typeDef.ui5TypeInfo.isInterface || typeDef.ui5TypeInfo.isClass) {
			//console.log(`[interface/class type]: '${typeInfo.ui5Type}', multiple: ${typeInfo.multiple}`);
			aggregationType = typeDef.ui5TypeInfo.ui5Type;
		}

		// DEBUG
		if (typeDef.isUnclear) {
			console.warn(`[unclear type 🤔] ${classDef.name} - aggregation '${slotDef.name}' has unclear type '${typeDef.origType}' -> defaulting to 'any', multiple: ${typeDef.ui5TypeInfo.multiple}`);
		}

		// The "default" slot will most likely be transformed into the "content" in UI5
		if (aggregationName === "default") {
			// but if a "_ui5propertyName" is defined, we regard it as a named aggregation!
			if (slotDef._ui5propertyName) {
				aggregationName = slotDef._ui5propertyName;
			} else {
				aggregationName = "content";
			}

			// on webc level the default slot has no name
			slotName = undefined;

			ui5metadata.defaultAggregation = aggregationName;
		}

		ui5metadata.aggregations[aggregationName] = {
			type: aggregationType,
			multiple: true,
			slot: slotName,
		};
		// note: in case we changed the name of the aggregation (e.g. default), we can't pass the slotDef directly!
		JSDocSerializer.writeDoc(classDef, "aggregations", {
			name: aggregationName,
			description: slotDef.description,
			moduleType: typeDef.ui5TypeInfo?.moduleType,
		});
		DTSSerializer.writeDts(classDef, "aggregations", {
			name: aggregationName,
			description: slotDef.description?.replace(/\n/g, "\n * "),
			types: typeDef.types,
		});
	}

	/**
	 * Parses the given event definition object and extracts the event parameters.
	 * The event parameters are also tracking their respective JSDoc description texts.
	 * @param {object} eventDef the event definition object from the custom elements metadata
	 * @returns the parsed event parameters
	 */
	#parseEventParameters(classDef, eventDef) {
		const parameters = eventDef._ui5parameters;
		const parsedParams = {};
		const jsDocParams = {};
		parameters?.forEach((param) => {
			const typeDef = this.#extractUi5Type(param.type);
			// DEBUG
			if (typeDef.isUnclear) {
				console.warn(`[unclear type 🤔] ${classDef.name} - event '${eventDef.name}' has unclear type '${typeDef.origType}' -> defaulting to 'any', multiple: ${typeDef.ui5TypeInfo.multiple}`);
			}
			parsedParams[param.name] = {
				type: typeDef.ui5TypeInfo.ui5Type,
				types: typeDef.types,
				dtsParamDescription: param.description?.replace(/\n/g, "\n * "),
			};
			jsDocParams[param.name] = {
				description: param.description,
			};
		});
		return { parsedParams, jsDocParams };
	}

	#parseMethodParameters(classDef, methodDef) {
		const parameters = methodDef.parameters;
		const jsDocParams = {};
		const parsedParams = {};
		parameters?.forEach((param) => {
			const typeDef = this.#extractUi5Type(param.type);
			// DEBUG
			if (typeDef.isUnclear) {
				console.warn(
					`[unclear type 🤔] ${classDef.name} - method '${methodDef.name}' has unclear type '${typeDef.origType}' -> defaulting to 'any', multiple: ${typeDef.ui5TypeInfo.multiple}`,
				);
			}
			jsDocParams[param.name] = {
				name: param.name,
				type: typeDef.ui5TypeInfo?.ui5Type || "any", // TODO: is this correct?
				description: param.description,
			};
			// parsedParams[param.name] = {
			// 	name: param.name,
			// 	typeDef,
			// 	description: param.description?.replace(/\n/g, "\n * "),
			// };
			parsedParams[param.name] = typeDef.types;
		});
		return { parsedParams, jsDocParams };
	}

	#processEvents(classDef, ui5metadata, eventDef) {
		// Same as with other entities we track the UI5 Metadata and the JSDoc separately
		const { parsedParams, jsDocParams } = this.#parseEventParameters(classDef, eventDef);
		const camelizedName = camelize(eventDef.name);

		ui5metadata.events[camelizedName] = {
			allowPreventDefault: eventDef._ui5allowPreventDefault,
			enableEventBubbling: eventDef._ui5Bubbles,
			parameters: parsedParams,
		};

		JSDocSerializer.writeDoc(classDef, "events", {
			name: camelizedName,
			description: eventDef.description,
			parameters: jsDocParams,
		});
		DTSSerializer.writeDts(classDef, "events", {
			name: camelizedName,
			description: eventDef.description?.replace(/\n/g, "\n * "),
			parameters: parsedParams,
		});
	}

	#processUI5Interfaces(classDef, ui5metadata) {
		let jsdocInterfaces;
		if (Array.isArray(classDef._ui5implements)) {
			jsdocInterfaces ??= [];
			classDef._ui5implements.forEach((interfaceDef) => {
				if (this.interfaces[interfaceDef.name]) {
					ui5metadata.interfaces.push(this.prefixns(interfaceDef.name));
					jsdocInterfaces.push(`module:${this.namespace}.${interfaceDef.name}`);
				} else {
					jsdocInterfaces.push(this.prefixns(interfaceDef.name));
				}
			});
		}

		// classes with properties marked as "_ui5formProperty" need to implement IFormContent
		if (classDef._ui5implementsFormContent) {
			ui5metadata.interfaces.push("sap.ui.core.IFormContent");
			classDef._ui5implements.push({
				name: "IFormContent",
				package: "sap/ui/core/library",
			});
			jsdocInterfaces ??= [];
			jsdocInterfaces.push("sap.ui.core.IFormContent");
		}
		classDef._ui5QualifiedInterfaceNamesSlashes = jsdocInterfaces;
	}

	/**
	 * Validates if the given property name is defined somewhere in the parent chain
	 * @param {string} className the starting class for which we will traverse the parent chain
	 * @param {string} propName the property to validate
	 */
	#ui5PropertyExistsInParentChain(classDef, propName) {
		// we need to stop the recursion on the very top level
		// The runtime base class does NOT provide any inherited properties!
		if (classDef.name === UI5_ELEMENT_CLASS_NAME) {
			return false;
		}
		// check self
		const hasProp = !!classDef?._ui5metadata?.properties?.[propName];
		if (hasProp) {
			return true;
		} else {
			// if we didn't find the property on this class, we go one step higher in the chain
			if (classDef?.superclass) {
				return this.#ui5PropertyExistsInParentChain(classDef.superclass, propName);
			} else {
				// finally nothing found
				return false;
			}
		}
	}

	#ensureDefaults(classDef, ui5metadata) {
		if (!this.#ui5PropertyExistsInParentChain(classDef, "text")) {
			// a text property must exist and be mapped to "textContent"
			ui5metadata.properties["text"] = {
				type: "string",
				mapping: "textContent",
			};
			const description = "The text-content of the Web Component.";
			JSDocSerializer.writeDoc(classDef, "properties", { name: "text", description });

			DTSSerializer.writeDts(classDef, "properties", {
				name: "text",
				description,
				types: [{ dtsType: "string" }],
			});
		}

		// cssProperties: [ "width", "height", "display" ]
		if (!this.#ui5PropertyExistsInParentChain(classDef, "width")) {
			ui5metadata.properties["width"] = {
				type: "sap.ui.core.CSSSize",
				mapping: "style",
			};
			const description = "The 'width' of the Web Component in <code>sap.ui.core.CSSSize</code>.";
			JSDocSerializer.writeDoc(classDef, "properties", { name: "width", description });

			DTSSerializer.writeDts(classDef, "properties", {
				name: "width",
				description,
				types: [
					{
						ui5Type: "sap.ui.core.CSSSize",
						packageName: "sap/ui/core/library",
						dtsType: "CSSSize",
					},
				],
			});
		}

		if (!this.#ui5PropertyExistsInParentChain(classDef, "height")) {
			ui5metadata.properties["height"] = {
				type: "sap.ui.core.CSSSize",
				mapping: "style",
			};
			const description = "The 'height' of the Web Component in <code>sap.ui.core.CSSSize</code>.";
			JSDocSerializer.writeDoc(classDef, "properties", { name: "height", description });
			DTSSerializer.writeDts(classDef, "properties", {
				name: "height",
				description,
				types: [
					{
						ui5Type: "sap.ui.core.CSSSize",
						packageName: "sap/ui/core/library",
						dtsType: "CSSSize",
					},
				],
			});
		}
	}

	/**
	 * Some web components need additional patches to comply with UI5 framework requirements,
	 * e.g. applying the LabelEnablement mixin
	 *
	 * Most things patched in this function should eventually be available generically in the custom elements metadta.
	 *
	 * @param {object} classDef the class definition object
	 * @param {object} ui5metadata the UI5 metadata object
	 */
	// TODO make DTS ready
	#patchUI5Specifics(classDef, ui5metadata) {
		// The tag of UI5 web components might be scoped with a suffix depending on the project configuration
		// we need to make tag.includes(...) checks instead of strict comparisons!
		let { tag } = ui5metadata;
		tag ??= ""; // ensure we have a string to work with, as some classes don't have a tag e.g. abstract base classes

		// TODO: This whole method needs to be adapted to correctly write JSDoc

		// The label has a couple of specifics that are not fully reflected in the custom elements.
		if (tag.includes("ui5-label")) {
			// the ui5-label has as default slot, but no aggregations on the retrofit layer...
			ui5metadata.aggregations = [];
			// the "for" attribute is called "labelFor" in the retrofit...
			ui5metadata.associations["labelFor"] = {
				type: "sap.ui.core.Control",
				multiple: false,
				mapping: {
					type: "property",
					to: "for",
				},
			};
			delete ui5metadata.properties["for"];

			// Any "Label" control needs a special UI5-only interface
			ui5metadata.interfaces.push("sap.ui.core.Label");

			classDef._ui5implements.push({
				name: "Label",
				package: "sap/ui/core/library",
			});
			// Additionally, all such controls must apply the "sap/ui/core/LabelEnablement" (see "../templates/WrapperControl.hbs")
			classDef._ui5specifics.needsLabelEnablement = true;

			DTSSerializer.updateDts(
				classDef,
				{
					name: "for",
					entity: "properties",
				},
				{
					name: "labelFor",
					entity: "associations",
					types: [
						{
							dtsType: "Control",
							packageName: "sap/ui/core/Control",
							moduleType: "module:sap/ui/core/Control",
							ui5Type: "sap.ui.core.Control",
							isClass: true,
						},
					],
				},
			);
		} else if (tag.includes("ui5-multi-input")) {
			// TODO: Multi Input needs to implement the functions defined in "sap.ui.core.ISemanticFormContent"...
			ui5metadata.interfaces.push("sap.ui.core.ISemanticFormContent");

			classDef._ui5implements.push({
				name: "ISemanticFormContent",
				package: "sap/ui/core/library",
			});
		} else if (tag.includes("ui5-shellbar")) {
			ui5metadata.interfaces.push("sap.m.IBar");
			classDef._ui5implements.push({
				name: "IBar",
				package: "sap/m/library",
			});

			ui5metadata.interfaces.push("sap.tnt.IToolHeader");
			classDef._ui5implements.push({
				name: "IToolHeader",
				package: "sap/tnt/library",
			});
		}

		// If a "valueStateMessage" slot is present, we need a special property mapping
		// and correct the "valueState" property's typing
		if (ui5metadata.aggregations["valueStateMessage"]) {
			if (ui5metadata.properties["valueState"]) {
				// there will not be an aggregation in UI5, but rather a string mapped property!
				delete ui5metadata.aggregations["valueStateMessage"];
				ui5metadata.properties["valueStateText"] = {
					name: "valueStateText",
					type: "string",
					defaultValue: "",
					mapping: {
						type: "slot",
						slotName: "valueStateMessage",
						// "mapping.to" describes the result in the webc DOM
						to: "div",
					},
				};

				// mixin support for handling of backend messages
				classDef._ui5specifics.needsMessageMixin = true;

				DTSSerializer.updateDts(
					classDef,
					{
						name: "valueStateMessage",
						entity: "aggregations",
					},
					{
						name: "valueStateText",
						entity: "properties",
						types: [
							{
								dtsType: "string",
								ui5Type: "string",
							},
						],
					},
				);
			} else {
				// this is an interesting inconsistency that does not occur in the UI5 web components
				// we report it here for custom web component development
				console.warn(
					`The class '${classDef._ui5QualifiedName}' defines a slot called 'valueStateMessage', but does not provide a corresponding 'valueState' property! A UI5 control expects both to be present for correct 'valueState' handling.`,
				);
			}
		}
	}

	/**
	 * Initializes basic properties on a class definition.
	 * The properties are expected during the WebComponentRegistry's metadata analysis.
	 *
	 * @param {object} classDef the class definition
	 */
	#initClass(classDef) {
		classDef._ui5metadata = {
			namespace: this.namespace,
			qualifiedNamespace: this.qualifiedNamespace,
			tag: classDef.scopedTagName || classDef.tagName,
			interfaces: [],
			properties: {},
			aggregations: {},
			associations: {},
			events: {},
			getters: [],
			methods: [],
		};
		// we track a couple of UI5 specifics like interfaces and mixins separately
		classDef._ui5specifics = {};
	}

	#createUI5Metadata(classDef) {
		const ui5metadata = classDef._ui5metadata;

		// we track the JSDoc extracted from the custom elements manifest separately,
		// as they are not part of the runtime metadata
		JSDocSerializer.initClass(classDef);
		DTSSerializer.initClass(classDef);

		classDef.members?.forEach((propDef) => {
			this.#processMembers(classDef, ui5metadata, propDef);
		});

		classDef.slots?.forEach((slotDef) => {
			this.#processSlots(classDef, ui5metadata, slotDef);
		});

		classDef.events?.forEach((eventDef) => {
			this.#processEvents(classDef, ui5metadata, eventDef);
		});

		this.#processUI5Interfaces(classDef, ui5metadata);

		this.#ensureDefaults(classDef, ui5metadata);

		this.#patchUI5Specifics(classDef, ui5metadata);

		DTSSerializer.writeClassBody(classDef);
	}

	/**
	 * Prepares the UI5 enum objects and enriches them with appropriate JSDoc.
	 * Used in the respective HBS template.
	 */
	#prepareEnums() {
		Object.keys(this.enums).forEach((enumName) => {
			const enumValues = [];

			const enumMembers = this.enums[enumName].members;
			enumMembers.forEach((member) => {
				// Key<>Value must be identical!
				enumValues.push({ name: member.name, description: member.description || "" });
			});

			// prepare enum info object for HBS template later
			this.enums[enumName] = {
				name: enumName,
				_ui5QualifiedName: this.prefixns(enumName),
				// TODO: Ideally not needed in the future once we have a solution for escaping in the UI5 JDSDoc build
				//       Also remember to remove the "@ui5-module-override" directives in the HBS templates!
				_ui5QualifiedNameSlashes: `${this.namespace}.${enumName}`,
				description: this.enums[enumName].description || "",
				values: enumValues,
			};
		});
	}

	/**
	 * Prepares the UI5 interface definitions and enriches them with appropriate JSDoc.
	 * Used in the respective HBS template.
	 */
	#prepareInterfaces() {
		Object.keys(this.interfaces).forEach((interfaceName) => {
			const interfaceDef = this.interfaces[interfaceName];
			interfaceDef._ui5QualifiedName = this.prefixns(interfaceName);
			// TODO: Ideally not needed in the future once we have a solution for escaping in the UI5 JDSDoc build
			//       Also remember to remove the "@ui5-module-override" directives in the HBS templates!
			interfaceDef._ui5QualifiedNameSlashes = `${this.namespace}.${interfaceName}`;
		});
	}
}

const WebComponentRegistry = {
	register({ customElementsMetadata, namespace, scopeSuffix, npmPackagePath, version, skipDtsGeneration = true }) {
		// Skips the *.d.ts file generation for TypeScript support, configured via ui5.yaml:
		//   - server/customMiddleware/ui5-tooling-modules-middleware/configuration/pluginOptions/webcomponents/skipDtsGeneration
		// and
		//   - builder/customTasks/ui5-tooling-modules-task/configuration/pluginOptions/webcomponents/skipDtsGeneration
		if (skipDtsGeneration) {
			DTSSerializer.deactivate();
		}

		let entry = _registry[namespace];
		if (!entry) {
			entry = _registry[namespace] = new RegistryEntry({ customElementsMetadata, namespace, scopeSuffix, npmPackagePath, version });

			// track all classes also via their module name,
			// so we can access them faster during resource resolution later on
			Object.keys(entry.classes).forEach((className) => {
				const classDef = entry.classes[className];
				this.addClassAlias(`${namespace}/${classDef.module}`, classDef);
			});
		}
		return entry;
	},

	getPackage(id) {
		// can also retrieve an alias
		return _registry[id];
	},

	/**
	 * Finds a class by its alias, e.g.
	 *   - module name
	 *   - absolute module path
	 * @param {string} id the module name or path for the intended class
	 * @returns {object|undefined} the class or undefined if not found
	 */
	getClassDefinition(id) {
		return _classAliases[id];
	},

	addClassAlias(alias, obj) {
		if (!_classAliases[alias]) {
			_classAliases[alias] = obj;
		}
	},

	clear() {
		_registry = {};
		_classAliases = {};
	},
};

module.exports = WebComponentRegistry;

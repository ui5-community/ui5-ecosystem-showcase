const JSDocSerializer = require("./JSDocSerializer");

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
	return "get" + functionName.substr(0, 1).toUpperCase() + functionName.substr(1);
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

	constructor({ customElementsMetadata, namespace, scopeSuffix, npmPackagePath, moduleBasePath, removeScopePrefix, version }) {
		this.#customElementsMetadata = customElementsMetadata;
		this.namespace = namespace;
		this.scopeSuffix = scopeSuffix;
		this.npmPackagePath = npmPackagePath;
		this.moduleBasePath = moduleBasePath;
		this.qualifiedNamespace = `${slash2dot(this.moduleBasePath)}.${slash2dot(removeScopePrefix ? this.namespace.replace(/^@/, "") : this.namespace)}`;
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

		console.log(`Metadata processed for package ${namespace}. Module base path: ${moduleBasePath}.`);
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

		// [2] Connect superclasses
		Object.keys(this.classes).forEach((className) => {
			const classDef = this.classes[className];

			this.#deriveUi5ClassNames(classDef);

			this.#connectSuperclass(classDef);

			this.#calculateScopedTagName(classDef);

			// [3] create UI5 metadata for each classed based on the parsed custom elements metadata
			//     Note: The order is important! We need to connect the superclass and create its metadata first.
			//           We need a fully constructed parent chain later for ensuring UI5 defaults (refer to #ensureDefaults)
			this.#createUI5Metadata(classDef);
		});

		// [4] prepare enum objects
		this.#prepareEnums();

		// [5] prepare interface definitions
		this.#prepareInterfaces();
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

	#calculateScopedTagName(classDef) {
		// only scope UI5Element subclasses
		if (this.scopeSuffix && WebComponentRegistry.isUI5ElementSubclass(classDef)) {
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
			}
			// HTMLElements are a valid type for event parameters
			if (lowerCaseName === "htmlelement") {
				return "HTMLElement";
			}
			return lowerCaseName;
		}
		return "string";
	}

	#checkForInterfaceOrClassType(type) {
		if (this.interfaces[type]) {
			return this.prefixns(type);
		} else if (this.classes[type]) {
			return this.classes[type]._ui5QualifiedName;
		}
	}

	#extractUi5Type(typeInfo) {
		// [Simple type]:
		// some types are given as a union type, e.g. "string | undefined"
		// TODO: are there combinations of arrays and other types/undefined? e.g. "Array<number> | undefined"
		//       Does that make sense? Probably should be an empty array instead of undefined?
		let parsedType = typeInfo?.text;
		if (parsedType?.indexOf("|") > 0) {
			const types = parsedType.split("|").map((s) => s.trim());

			// case 1: "htmlelement | string" is an association, e.g. the @ui5-webcomponents/Popover#opener
			if (types.includes("HTMLElement") && types.includes("string")) {
				return {
					isAssociation: true,
					origType: "HTMLElement",
					ui5Type: "sap.ui.core.Control",
				};
			}

			// UI5 only accepts one type for a property/aggregation, in this case we just use the first one as the primary type.
			parsedType = types[0];
		}

		// check if we have an array type
		const arrayTypeMatch = parsedType?.match(/Array<(.*)>/i);
		const multiple = !!arrayTypeMatch;

		// [Complex types]:
		// we have a reference to other things -> enums, interfaces, classes
		if (typeInfo?.references?.length > 0) {
			// Since the UI5 runtime only allows for 1 single type per property/aggregation, we take the first reference
			parsedType = typeInfo.references[0].name;

			// TODO: Investigate if this fallback can be omitted, I suspect it is not needed.
			//       The string based type "arrayTypeMatch[1]" might contain TypeScript generics, which are not known (and irrelevant) to UI5 -> e.g. P13nPopup
			parsedType ??= arrayTypeMatch?.[1] || parsedType;

			// case 2: enum type -> easy
			if (this.enums[parsedType]) {
				return {
					origType: parsedType,
					ui5Type: this.prefixns(parsedType),
					multiple,
				};
			}

			// case 3: interface or class type
			const interfaceOrClassType = this.#checkForInterfaceOrClassType(parsedType);

			if (interfaceOrClassType) {
				return {
					isInterfaceOrClassType: true,
					origType: parsedType,
					ui5Type: interfaceOrClassType,
					multiple,
				};
			}

			// case 4: check for cross package type reference
			const refPackage = WebComponentRegistry.getPackage(typeInfo.references[0]?.package);
			if (refPackage?.enums?.[parsedType]) {
				return {
					origType: parsedType,
					ui5Type: refPackage.prefixns(parsedType),
					multiple,
				};
			}

			return {
				isUnclear: true,
				origType: parsedType,
				ui5Type: "any",
				multiple,
			};
		} else {
			// determine the primitive type from the array type
			parsedType = arrayTypeMatch?.[1] || parsedType;

			// case 5: primitive types
			return {
				origType: parsedType,
				ui5Type: this.#normalizeType(parsedType),
				multiple,
			};
		}
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

			return true;
		} else if (propDef.name === "textDirection") {
			// text direction needs to be mapped to the native "dir"
			ui5metadata.properties["textDirection"] = {
				type: "sap.ui.core.TextDirection",
				defaultValue: "TextDirection.Inherit",
				mapping: {
					type: "property",
					to: "dir",
					formatter: "_mapTextDirection",
				},
			};
			JSDocSerializer.writeDoc(classDef, "properties", propDef);
			return true;
		}

		return false;
	}

	#processMembers(classDef, ui5metadata, propDef) {
		// field -> property or association
		if (propDef.kind === "field") {
			let ui5TypeInfo = this.#extractUi5Type(propDef.type);

			// ACC attributes have webc internal typing and will be defaulted to "object" ob UI5 side.
			if (propDef.name === "accessibilityAttributes") {
				ui5TypeInfo.ui5Type = "object";
				ui5TypeInfo.isUnclear = false;
			}

			// Some properties might need a special UI5 mapping, e.g. "accesibleNameRef"
			const hasSpecialMapping = this.#checkForSpecialMapping(classDef, propDef, ui5metadata);
			if (hasSpecialMapping) {
				return;
			}

			// DEBUG
			if (ui5TypeInfo.isUnclear) {
				console.warn(`[unclear type 🤔] ${classDef.name} - property '${propDef.name}' has unclear type '${ui5TypeInfo.origType}' -> defaulting to 'any', multiple: ${ui5TypeInfo.multiple}`);
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
			} else if (ui5TypeInfo.isInterfaceOrClassType) {
				console.warn(`[interface or class type given for property] ${classDef.name} - property ${propDef.name}`);
			} else if (ui5TypeInfo.isAssociation) {
				ui5metadata.associations[propDef.name] = {
					type: ui5TypeInfo.ui5Type,
					mapping: {
						type: "property", // assoc. are always property mappings
						to: propDef.name, // the name of the webc's attribute
					},
				};
				JSDocSerializer.writeDoc(classDef, "associations", propDef);
			} else {
				let defaultValue = propDef.default;
				if (defaultValue) {
					// TODO: Why are the default value strings escaped?
					if (typeof defaultValue === "string") {
						defaultValue = defaultValue.replace(/"/g, "");
					}

					defaultValue = this.#castDefaultValue(defaultValue, ui5TypeInfo);
				}

				ui5metadata.properties[propDef.name] = {
					type: `${ui5TypeInfo.ui5Type}${ui5TypeInfo.multiple ? "[]" : ""}`,
					mapping: "property",
					defaultValue: defaultValue,
				};
				JSDocSerializer.writeDoc(classDef, "properties", propDef);
			}
		} else if (propDef.kind === "method") {
			// Methods are proxied through the core.WebComponent base class
			// e.g. DatePicker#isValid or Toolbar#isOverflowOpen
			ui5metadata.methods.push(propDef.name);

			// method have parameters (unlike getters)
			const jsDocParams = this.#parseMethodParameters(propDef);
			JSDocSerializer.writeDoc(classDef, "methods", {
				name: propDef.name,
				description: propDef.description,
				parameters: jsDocParams,
			});
		}
	}

	#processSlots(classDef, ui5metadata, slotDef) {
		let aggregationName = slotDef.name;
		let slotName = slotDef.name;

		// should be the most relevant default type
		let aggregationType = "sap.ui.core.Control";

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

		if (slotDef._ui5type?.text !== "Array<HTMLElement>") {
			const typeInfo = this.#extractUi5Type(slotDef._ui5type);
			if (typeInfo.isInterfaceOrClassType) {
				//console.log(`[interface/class type]: '${typeInfo.ui5Type}', multiple: ${typeInfo.multiple}`);
				aggregationType = typeInfo.ui5Type;
			}
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
		JSDocSerializer.writeDoc(classDef, "aggregations", { name: aggregationName, description: slotDef.description });
	}

	/**
	 * Parses the given event definition object and extracts the event parameters.
	 * The event parameters are also tracking their respective JSDoc description texts.
	 * @param {object} eventDef the event definition object from the custom elements metadata
	 * @returns the parsed event parameters
	 */
	#parseEventParameters(eventDef) {
		const parameters = eventDef._ui5parameters;
		const parsedParams = {};
		const jsDocParams = {};
		parameters?.forEach((param) => {
			const type = this.#extractUi5Type(param.type);
			parsedParams[param.name] = {
				type: type.ui5Type,
			};
			jsDocParams[param.name] = {
				description: param.description,
			};
		});
		return { parsedParams, jsDocParams };
	}

	#parseMethodParameters(methodDef) {
		const parameters = methodDef.parameters;
		const jsDocParams = {};
		parameters?.forEach((param) => {
			const type = this.#extractUi5Type(param.type);
			jsDocParams[param.name] = {
				name: param.name,
				type: type.ui5Type,
				description: param.description,
			};
		});
		return jsDocParams;
	}

	#processEvents(classDef, ui5metadata, eventDef) {
		// Same as with other entities we track the UI5 Metadata and the JSDoc separately
		const { parsedParams, jsDocParams } = this.#parseEventParameters(eventDef);
		const camelizedName = camelize(eventDef.name);

		ui5metadata.events[camelizedName] = {
			parameters: parsedParams,
		};

		JSDocSerializer.writeDoc(classDef, "events", {
			name: camelizedName,
			description: eventDef.description,
			parameters: jsDocParams,
		});
	}

	#processUI5Interfaces(classDef, ui5metadata) {
		if (Array.isArray(classDef._ui5implements)) {
			classDef._ui5implements.forEach((interfaceDef) => {
				if (this.interfaces[interfaceDef.name]) {
					ui5metadata.interfaces.push(this.prefixns(interfaceDef.name));
				}
			});
		}

		// classes with properties marked as "_ui5formProperty" need to implement IFormContent
		if (classDef._ui5implementsFormContent) {
			ui5metadata.interfaces.push("sap.ui.core.IFormContent");
		}
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
			JSDocSerializer.writeDoc(classDef, "properties", { name: "text", description: "The text-content of the Web Component." });
		}

		// cssProperties: [ "width", "height", "display" ]
		if (!this.#ui5PropertyExistsInParentChain(classDef, "width")) {
			ui5metadata.properties["width"] = {
				type: "sap.ui.core.CSSSize",
				mapping: "style",
			};
			JSDocSerializer.writeDoc(classDef, "properties", { name: "width", description: "The 'width' of the Web Component in <code>sap.ui.core.CSSSize</code>." });
		}

		if (!this.#ui5PropertyExistsInParentChain(classDef, "height")) {
			ui5metadata.properties["height"] = {
				type: "sap.ui.core.CSSSize",
				mapping: "style",
			};
			JSDocSerializer.writeDoc(classDef, "properties", { name: "height", description: "The 'height' of the Web Component in <code>sap.ui.core.CSSSize</code>." });
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
			// Additionally, all such controls must apply the "sap/ui/core/LabelEnablement" (see "../templates/WrapperControl.hbs")
			classDef._ui5specifics.needsLabelEnablement = true;
		} else if (tag.includes("ui5-multi-input")) {
			// TODO: Multi Input needs to implement the functions defined in "sap.ui.core.ISemanticFormContent"...
			ui5metadata.interfaces.push("sap.ui.core.ISemanticFormContent");
		} else if (tag === "ui5-shellbar") {
			ui5metadata.interfaces.push("sap.m.IBar");
			ui5metadata.interfaces.push("sap.tnt.IToolHeader");
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

				// the UI5 valueState needs the Core's enum typing and some special mapping to
				// convert the "sap.ui.core.ValueState" to the web component's variant.
				Object.assign(ui5metadata.properties["valueState"], {
					type: "sap.ui.core.ValueState",
					mapping: {
						formatter: "_mapValueState",
						parser: "_parseValueState",
					},
				});

				// mixin support for handling of backend messages
				classDef._ui5specifics.needsMessageMixin = true;
			} else {
				// this is an interesting inconsistency that does not occur in the UI5 web components
				// we report it here for custom web component development
				console.warn(
					`The class '${classDef._ui5QualifiedName}' defines a slot called 'valueStateMessage', but does not provide a corresponding 'valueState' property! A UI5 control expects both to be present for correct 'valueState' handling.`,
				);
			}
		}
	}

	#createUI5Metadata(classDef) {
		const ui5metadata = (classDef._ui5metadata = {
			namespace: this.namespace,
			qualifiedNamespace: this.qualifiedNamespace,
			tag: classDef.scopedTagName || classDef.tagName,
			interfaces: [],
			properties: {},
			aggregations: {},
			associations: {},
			events: {},
			// https://github.com/SAP/openui5/blob/master/src/sap.ui.core/src/sap/ui/core/webc/WebComponent.js#L570C25-L601
			getters: [],
			methods: [],
		});

		// we track the JSDoc extracted from the custom elements manifest separately,
		// as they are not part of the runtime metadata
		JSDocSerializer.initClass(classDef);

		// we track a couple of UI5 specifics like interfaces and mixins separately
		classDef._ui5specifics = {};

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
				_ui5QualifiedNameSlashes: this.qualifiedNamespace.replace(/\./g, "/"),
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
			interfaceDef._ui5QualifiedNameSlashes = this.qualifiedNamespace.replace(/\./g, "/");
		});
	}
}

const WebComponentRegistry = {
	register({ customElementsMetadata, namespace, scopeSuffix, npmPackagePath, version, moduleBasePath, removeScopePrefix }) {
		let entry = _registry[namespace];
		if (!entry) {
			entry = _registry[namespace] = new RegistryEntry({ customElementsMetadata, namespace, scopeSuffix, npmPackagePath, moduleBasePath, removeScopePrefix, version });

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

	/**
	 * Helper function to check whether the given class inherits from UI5Element, the base class for all
	 * UI5 web components.
	 *
	 * @param {object} classDef a class definition from a WebComponentRegistry entry
	 * @returns {boolean} whether the class inherits from UI5Element
	 */
	isUI5ElementSubclass(classDef) {
		let superclass = classDef.superclass,
			isUI5ElementSubclass = false;
		while (superclass) {
			if (superclass?.namespace === "@ui5/webcomponents-base" && superclass?.name === "UI5Element") {
				isUI5ElementSubclass = true;
				break;
			}
			superclass = superclass.superclass;
		}
		return isUI5ElementSubclass;
	},
};

module.exports = WebComponentRegistry;

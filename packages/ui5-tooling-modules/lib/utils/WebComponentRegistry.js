/**
 * Camelize the dashes.
 * Used to transform event names.
 */
const camelize = (str) => {
	return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

const _registry = {};

const _classAliases = {};

// TODO: Make "classes" into... a class :)
//       Get's rid of passing the "classDef" and the "ui5metadata" around.
class RegistryEntry {
	#customElementsMetadata = {};

	constructor({ customElementsMetadata, namespace, npmPackagePath, version }) {
		this.#customElementsMetadata = customElementsMetadata;
		this.namespace = namespace;
		this.npmPackagePath = npmPackagePath;
		this.version = version;

		this.customElements = {};
		this.classes = {};
		this.enums = {};
		this.interfaces = new Set();

		this.#processMetadata();

		console.log(`Metadata processed for package ${namespace}.`);
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
			this.#connectSuperclass(classDef);

			// [3] create UI5 metadata for each classed based on the parsed custom elements metadata
			this.#createUI5Metadata(classDef);
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
				this.interfaces.add(decl.name);
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
		if (classDef.superclass) {
			const superclassName = classDef.superclass.name;

			// the top most superclass is "UI5Element", which at runtime is essentially "sap/ui/core/WebComponent"
			if (superclassName !== "UI5Element") {
				// determine superclass cross-package
				let superclassRef = this.classes[superclassName];
				if (!superclassRef) {
					const refPackage = WebComponentRegistry.getPackage(classDef.superclass.package);
					superclassRef = refPackage?.classes[superclassName];
				}
				if (!superclassRef) {
					console.error(`The class '${this.namespace}/${classDef.name}' has an unknown superclass '${classDef.superclass.package}/${superclassName}'!`);
				} else {
					this.#connectSuperclass(superclassRef);
					classDef.superclass = superclassRef;
				}
			}
		}
	}

	prefixns(str) {
		return `${this.namespace}.${str}`;
	}

	// --- UI5 Metadata transformer below ---

	#normalizeType(type) {
		if (type) {
			const lowerCaseName = type.toLowerCase();
			if (type.toLowerCase() === "number") {
				return "float";
			}
			return lowerCaseName;
		}
		return "string";
	}

	#checkForInterfaceOrClassType(type) {
		if (this.interfaces.has(type) || this.classes[type]) {
			return this.prefixns(type);
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
	#checkForSpecialMapping(propDef, ui5metadata) {
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
			return true;
		} else if (propDef.name === "disabled") {
			// "disabled" maps to "enabled" in UI5
			ui5metadata.properties["enabled"] = {
				type: "boolean",
				defaultValue: "true",
				mapping: {
					type: "property",
					to: "disabled",
					formatter: "_mapEnabled",
				},
			};
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
			const hasSpecialMapping = this.#checkForSpecialMapping(propDef, ui5metadata);
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
				// calculated readonly fields -> WebC base class will generate getters
				// e.g. AvatarGroup#getColorScheme
				ui5metadata.getters.push(propDef.name);
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
			}
		} else if (propDef.kind === "method") {
			// Methods are proxied through the core.WebComponent base class
			// e.g. DatePicker#isValid or Toolbar#isOverflowOpen
			ui5metadata.methods.push(propDef.name);
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
	}

	#processEvents(ui5metadata, eventDef) {
		ui5metadata.events[camelize(eventDef.name)] = {};
	}

	#processUI5Interfaces(classDef, ui5metadata) {
		if (Array.isArray(classDef._ui5implements)) {
			classDef._ui5implements.forEach((interfaceDef) => {
				if (this.interfaces.has(interfaceDef.name)) {
					ui5metadata.interfaces.push(this.prefixns(interfaceDef.name));
				}
			});
		}

		// classes with properties marked as "_ui5formProperty" need to implement IFormContent
		if (classDef._ui5implementsFormContent) {
			ui5metadata.interfaces.push("sap.ui.core.IFormContent");
		}
	}

	#ensureDefaults(ui5metadata) {
		// a text property must exist and be mapped to "textContent"
		if (!ui5metadata.properties["text"]) {
			ui5metadata.properties["text"] = {
				type: "string",
				mapping: "textContent",
			};
		}

		// cssProperties: [ "width", "height", "display" ]
		if (!ui5metadata.properties["width"]) {
			ui5metadata.properties["width"] = {
				type: "sap.ui.core.CSSSize",
				mapping: "style",
			};
		}

		if (!ui5metadata.properties["height"]) {
			ui5metadata.properties["height"] = {
				type: "sap.ui.core.CSSSize",
				mapping: "style",
			};
		}
	}

	/**
	 * Some web components need additional patches to comply with UI5 framework requirements,
	 * e.g. applying the LabelEnablement mixin
	 *
	 * Most things patched in this function should eventually be available generically in the custom elements metadta.
	 *
	 * @param {object} ui5metadata the UI5 metadata object
	 */
	#patchUI5Specifics(classDef, ui5metadata) {
		const { tag } = ui5metadata;

		// The label has a couple of specifics that are not fully reflected in the custom elements.
		if (tag === "ui5-label") {
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
			classDef._ui5NeedsLabelEnablement = true;
		} else if (tag === "ui5-multi-input") {
			// TODO: Multi Input needs to implement the functions defined in "sap.ui.core.ISemanticFormContent"...
			ui5metadata.interfaces.push("sap.ui.core.ISemanticFormContent");
		}
	}

	#createUI5Metadata(classDef) {
		const ui5metadata = (classDef._ui5metadata = {
			namespace: this.namespace,
			tag: classDef.tagName,
			interfaces: [],
			properties: {},
			aggregations: {},
			associations: {},
			events: {},
			// https://github.com/SAP/openui5/blob/master/src/sap.ui.core/src/sap/ui/core/webc/WebComponent.js#L570C25-L601
			getters: [],
			methods: [],
		});

		classDef.members?.forEach((propDef) => {
			this.#processMembers(classDef, ui5metadata, propDef);
		});

		classDef.slots?.forEach((slotDef) => {
			this.#processSlots(classDef, ui5metadata, slotDef);
		});

		classDef.events?.forEach((eventDef) => {
			this.#processEvents(ui5metadata, eventDef);
		});

		this.#processUI5Interfaces(classDef, ui5metadata);

		this.#ensureDefaults(ui5metadata);

		this.#patchUI5Specifics(classDef, ui5metadata);
	}
}

const WebComponentRegistry = {
	register({ customElementsMetadata, namespace, npmPackagePath, version }) {
		let entry = _registry[namespace];
		if (!entry) {
			entry = _registry[namespace] = new RegistryEntry({ customElementsMetadata, namespace, npmPackagePath, version });

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
};

module.exports = WebComponentRegistry;

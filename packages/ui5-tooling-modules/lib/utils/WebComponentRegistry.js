/**
 * Camelize the dashes.
 * Used to transform event names.
 */
const camelize = (str) => {
	return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

const _registry = {};

const _classAliases = {};

const _classes = {};

// TODO: Make "classes" into... a class :)
//       Get's rid of passing the "classDef" and the "ui5metadata" around.
class RegistryEntry {
	#customElementsMetadata = {};

	constructor({ customElementsMetadata, namespace, npmPackagePath }) {
		this.#customElementsMetadata = customElementsMetadata;
		this.namespace = namespace;
		this.npmPackagePath = npmPackagePath;

		this.customElements = {};
		this.classes = {};
		this.enums = {};
		this.interfaces = new Set();

		// TODO: Should not be needed later!
		this.#patchMissingEnums();

		this.#processMetadata();
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
					if (!superclassRef) {
						console.error(`The class '${this.namespace}/${classDef.name}' has an unknown superclass '${classDef.superclass.package}/${superclassName}'!`);
					}
				}
				this.#connectSuperclass(superclassRef);
				classDef.superclass = superclassRef;
			}
		}
	}

	prefixns(str) {
		return `${this.namespace}.${str}`;
	}

	/**
	 * TODO: We patch some enums as a workaround so that the wrapper controls behave correctly.
	 *       We need to find out why some enums are not contained in the custom elements manifest.
	 */
	#patchMissingEnums() {
		if (this.namespace === "@ui5/webcomponents") {
			this.enums["ValueState"] = {
				kind: "enum",
				name: "ValueState",
				members: [{ name: "None" }, { name: "Positive" }, { name: "Critical" }, { name: "Negative" }, { name: "Information" }],
			};
		}
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
		// some types are given as a union type, e.g. "string | undefined"
		// TODO: are there combinations of arrays and other types/undefined? e.g. "Array<number> | undefined"
		//       Does that make sense? Probably should be an empty array instead of undefined?
		let parsedType = typeInfo?.text;
		if (parsedType?.indexOf("|") > 0) {
			parsedType = parsedType.replace(/ \| undefined/g, "");
		}

		// check if we have an array type
		const arrayTypeMatch = parsedType?.match(/Array<(.*)>/i);
		const multiple = !!arrayTypeMatch;
		parsedType = arrayTypeMatch?.[1] || parsedType;

		// complex types have a reference to other things, e.g. enums
		if (typeInfo?.references) {
			// case 1: enum type -> easy
			if (this.enums[parsedType]) {
				return {
					origType: parsedType,
					ui5Type: this.prefixns(parsedType),
					multiple,
				};
			}

			// case 2: interface type -> theoretically this should this be a 0..n aggregation... but really?
			const interfaceOrClassType = this.#checkForInterfaceOrClassType(parsedType);

			if (interfaceOrClassType) {
				// TODO: How should this be wired in the wrapper?
				//       Is this a calculated property...?
				return {
					isInterfaceOrClassType: true,
					origType: parsedType,
					ui5Type: interfaceOrClassType,
					multiple,
				};
			}

			// case 3: hm... neither primitive, nor enum or interface/class type
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
			// primitive types
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

	#processMembers(classDef, ui5metadata, propDef) {
		// field -> property
		if (propDef.kind === "field") {
			const ui5TypeInfo = this.#extractUi5Type(propDef.type);

			// DEBUG
			if (ui5TypeInfo.isUnclear) {
				console.warn(`[unclear type 🤔] ${classDef.name} - property '${propDef.name}' has unclear type '${ui5TypeInfo.origType}' -> defaulting to 'any', multiple: ${ui5TypeInfo.multiple}`);
			}

			// TODO: What to do with "readonly" and/or interface and class types for fields?
			//       They seem to be calculated fields that don't map to a property/aggregation.
			//       We could make them into just a getter, which returns the queried attribute of the webc DOM (?)
			if (propDef.readonly) {
				// s.a.
				console.log(`[readonly field] ${classDef.name} - property ${propDef.name}`);
			} else if (!ui5TypeInfo.isInterfaceOrClassType) {
				let defaultValue = propDef.default;

				// TODO: Why are the default value strings escaped?
				if (typeof defaultValue === "string") {
					defaultValue = defaultValue.replace(/"/g, "");
				}

				defaultValue = this.#castDefaultValue(defaultValue, ui5TypeInfo);

				ui5metadata.properties[propDef.name] = {
					type: `${ui5TypeInfo.ui5Type}${ui5TypeInfo.multiple ? "[]" : ""}`,
					mapping: "property",
					defaultValue: defaultValue,
				};
			}
		} else if (propDef.kind === "method") {
			// TODO: methods
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

		// "default" slot becomes default aggregation
		if (aggregationName === "default") {
			// we call it "content" in ui5 though
			aggregationName = "content";
			// default slot has no name
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
	}

	#ensureDefaults(ui5metadata) {
		// a text property must exist and be mapped to "textContent"
		if (!ui5metadata.properties["text"]) {
			ui5metadata.properties["text"] = {
				type: "string",
				mapping: "textContent",
			};
		}

		// mandatory default aggregation
		if (!ui5metadata.defaultAggregation) {
			ui5metadata.aggregations["default"] = {
				type: "sap.ui.core.Control",
				multiple: true,
			};
			ui5metadata.defaultAggregation = "default";
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
	}
}

const WebComponentRegistry = {
	register({ customElementsMetadata, namespace, npmPackagePath }) {
		let entry = _registry[namespace];
		if (!entry) {
			entry = _registry[namespace] = new RegistryEntry({ customElementsMetadata, namespace, npmPackagePath });

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

	getClassDef(id) {
		return _classes[id];
	},

	addClassDef(alias, obj) {
		if (!_classes[alias]) {
			_classes[alias] = obj;
		}
	},
};

module.exports = WebComponentRegistry;

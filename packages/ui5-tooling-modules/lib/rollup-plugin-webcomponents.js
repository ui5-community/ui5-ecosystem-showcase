const { join, dirname, extname } = require("path");

// Inspired by https://rollupjs.org/plugin-development/#resolveid (the Polyfill Injection)
const SUFFIX_WEBC = "?webcomponent";
const SUFFIX_WEBC_LIB = "?webcomponent-library";

const registry = {};

module.exports = function ({ resolveModule } = {}) {

	const camelize = (str) => {
		return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
	};

	const processWebComponentsMetadata = (registryEntry) => {

		// prepare registry for processed metadata
		Object.assign(registryEntry, {
			customElements: {},
			classes: {},
			enums: {},
			interfaces: new Set()
		});

		function parseDeclaration(decl) {
			switch (decl.kind) {
				case "class": registryEntry.classes[decl.name] = decl; break;
				case "enum": registryEntry.enums[decl.name] = decl; break;
				case "interface": registryEntry.interfaces.add(decl.name); break;
				default: console.error("unknown declaration kind:", decl.kind);
			}
		}

		function parseExports(exp) {

			const exportName = exp.declaration.name;

			// try to identify class for the custom element
			const correspondingClass = registryEntry.classes[exportName];

			if (correspondingClass) {
				// find module name
				correspondingClass.module = exp.declaration?.module;
			}

			if (exp.kind === "custom-element-definition") {
				registryEntry.customElements[exportName] = correspondingClass || {};
			}
		}

		function connectSuperclass(classDef) {
			if (classDef.superclass) {
				const superclassName = classDef.superclass.name;
				if (superclassName !== "UI5Element") {
					const superclassRef = registryEntry.classes[superclassName];
					connectSuperclass(superclassRef);
					classDef.superclass = superclassRef;
				}
			}
		}

		function prefixns(str) {
			return `${registryEntry.namespace}.${str}`
		}

		/**
		 * Creates the UI5 metadata from the given class definition.
		 * The class definition stems from the custom elements manifest.
		 */
		function createUI5Metadata(classDef) {

			function normalizeType(type) {
				if (type) {
					const lowerCaseName = type.toLowerCase();
					if (type.toLowerCase() === "number") {
						return "float";
					}
					return lowerCaseName;
				}
				return "string";
			}

			function checkForInterfaceOrClassType(type) {
				if (registryEntry.interfaces.has(type) || registryEntry.classes[type]) {
					return prefixns(type);
				}
			}

			function extractUi5Type(typeInfo) {
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
					if (registryEntry.enums[parsedType]) {
						return {
							origType: parsedType,
							ui5Type: prefixns(parsedType),
							multiple
						}
					}

					// case 2: interface type -> theoretically this should this be a 0..n aggregation... but really?
					const interfaceOrClassType = checkForInterfaceOrClassType(parsedType);

					if (interfaceOrClassType) {
						// TODO: How should this be wired in the wrapper?
						//       Is this a calculated property...?
						return {
							isInterfaceOrClassType: true,
							origType: parsedType,
							ui5Type: interfaceOrClassType,
							multiple
						};
					}

					// case 3: hm... neither primitive, nor enum or interface/class type
					return {
						isUnclear: true,
						origType: parsedType,
						ui5Type: "any",
						multiple
					};
				} else {
					// primitive types
					return {
						origType: parsedType,
						ui5Type: normalizeType(parsedType),
						multiple
					};
				}
			}

			function processMembers(propDef) {
				// field -> property
				if (propDef.kind === "field") {
					const ui5TypeInfo = extractUi5Type(propDef.type);

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
					} else if (!ui5TypeInfo.isInterfaceOrClassType){
						let defaultValue = propDef.default;

						// TODO: Why are the default value strings escaped?
						if (typeof defaultValue === "string") {
							defaultValue = defaultValue.replace(/"/g, "");
						}

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

			function processSlots(slotDef) {
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
					const typeInfo = extractUi5Type(slotDef._ui5type);
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
					slot: slotName
				}
			}

			function processEvents(eventDef) {
				ui5metadata.events[camelize(eventDef.name)] = {};
			}

			function processUI5Interfaces() {
				if (Array.isArray(classDef._ui5implements)) {
					classDef._ui5implements.forEach((interfaceDef) => {
						if (registryEntry.interfaces.has(interfaceDef.name)) {
							ui5metadata.interfaces.push(prefixns(interfaceDef.name));
						}
					});
				}
			}

			function ensureDefaults() {
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

			const ui5metadata = classDef._ui5metadata = {
				namespace: registryEntry.namespace,
				tag: classDef.tagName,
				interfaces: [],
				properties: {},
				aggregations: {},
				associations: {},
				events: {},
				// https://github.com/SAP/openui5/blob/master/src/sap.ui.core/src/sap/ui/core/webc/WebComponent.js#L570C25-L601
				getters: [],
				methods: [],
			};

			classDef.members?.forEach(processMembers);

			classDef.slots?.forEach(processSlots);

			classDef.events?.forEach(processEvents);

			processUI5Interfaces();

			ensureDefaults();
		}

		registryEntry.modules?.forEach((module) => {
			module.declarations?.forEach(parseDeclaration);
			module.exports?.forEach(parseExports);
		});

		Object.keys(registryEntry.classes).forEach((className) => {
			const classDef = registryEntry.classes[className];
			connectSuperclass(classDef);

			createUI5Metadata(classDef);
		});

	};


	const lookupWebComponentsClass = (source) => {
		const absModulePath = resolveModule(source);
		if (registry[absModulePath]) {
			return registry[absModulePath];
		}

		// determine npm package
		const npmPackageScopeRegEx = /^((?:(@[^/]+)\/)?([^/]+))(?:\/(.*))?$/;
		const npmPackage = npmPackageScopeRegEx.exec(source)?.[1];

		if (!registry[npmPackage]) {
			const packageJsonPath = resolveModule(`${npmPackage}/package.json`);
			if (packageJsonPath) {
				const packageJson = require(packageJsonPath);
				if (!registry[npmPackage] && packageJson.customElements) {
					// load custom elements metadata
					const metadataPath = resolveModule(join(npmPackage, packageJson.customElements.replace("custom-elements.json", "custom-elements-internal.json")));
					registry[npmPackage] = require(metadataPath);
					registry[npmPackage].namespace = npmPackage;
					registry[npmPackage].npmPackagePath = dirname(packageJsonPath);
					processWebComponentsMetadata(registry[npmPackage]);
				}
			}
		}

		if (registry[npmPackage]) {
			const metadata = registry[npmPackage];
			const modulePath = absModulePath.substr(metadata.npmPackagePath.length + 1);

			const clazz = Object.values(metadata.classes).find(clazz => clazz.module === modulePath);
			clazz.modulePath = absModulePath;
			clazz.moduleName = `${npmPackage}/${modulePath.substr(0, modulePath.length - extname(modulePath).length)}`;
			registry[absModulePath] = clazz;
			return clazz;
		}
	}

	return {
		name: "webcomponents",
		async resolveId(source/*, importer, options*/) {
			if (
				source === "sap/ui/core/webc/WebComponent" ||
				source === "sap/ui/base/DataType"
			) {
				// mark Ui5 runtime dependencies as external
				// to avoid warnings about missing dependencies
				return {
					id: source,
					external: true
				};
			} else if (source.endsWith("/library")) {
				// remove /library using regex
				const parts = /^(.*)\/library(?:.js)?$/.exec(source);
				if (parts && registry[parts[1]]) {
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
				if (parts && registry[parts[1]]) {
					const namespace = parts[1];
					const metadata = registry[namespace];

					let code = `import { registerEnum } from "sap/ui/base/DataType";\n`;

					const registerEnum = (enumName, enumDef) => {
						const enumValues = {};
						enumDef.members.forEach((entry) => {
							enumValues[entry.name] = entry.name;
						});
						code += `registerEnum(${JSON.stringify(`${namespace}.${enumName}`)}, ${JSON.stringify(enumValues)});\n`;
					}

					// register the enums
					Object.keys(metadata.enums).forEach((enumName) => {
						registerEnum(enumName, metadata.enums[enumName]);
					});

					return code;
				}

			} else if (id.endsWith(SUFFIX_WEBC)) {
				const entryId = id.slice(0, -SUFFIX_WEBC.length);
				const clazz = registry[entryId];
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
				// Import all required types
				/*
				Object.entries(clazzTypes).forEach(([name, type]) => {
					code += `import ${name} from ${JSON.stringify(type.modulePath)};\n`;
				});
				*/
				// Extend the superclass with the WebComponent class and export it
				code += `export default WebComponentBaseClass.extend(${JSON.stringify(clazz.moduleName)}, { metadata: ${JSON.stringify(clazz._ui5metadata, undefined, 2)} });\n`;
				return code;
			}
			return null;
		},
	};
};

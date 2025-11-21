const SimpleLogger = require("./SimpleLogger");
const logger = SimpleLogger.create("📚 JSDoc");
const { loadAndCompile, baseTemplate } = require("./HandlebarsHelper");
const WebComponentRegistryHelper = require("./WebComponentRegistryHelper");

/**
 * All needed HBS templates for serializing JSDoc comments.
 */
const Templates = {
	classHeader: loadAndCompile("../templates/jsdoc/ClassHeader.hbs"),
	ui5metadata: loadAndCompile("../templates/jsdoc/UI5Metadata.hbs"),
	event: loadAndCompile("../templates/jsdoc/Event.hbs"),
	methodsAndGetters: loadAndCompile("../templates/jsdoc/MethodsAndGetter.hbs"),
};

/**
 * Converts dots in a string to slashes.
 * @param {string} s the dotted string
 * @returns {string} the slashed string
 */
function dot2slash(s) {
	return s.replace(/\./g, "/");
}

/**
 * Renders the class header as a JSDoc comment.
 * @param {object} classDef the class definition from the custom elements manifest
 * @param {string} jsdocTags JSDoc tags
 */
function _serializeClassHeader(classDef, jsdocTags) {
	// find superclass name, either another wrapper OR the core WebComponent base class
	let superclassName = classDef.superclass.name;
	if (WebComponentRegistryHelper.isUI5Element(classDef.superclass) || WebComponentRegistryHelper.isWebComponent(classDef.superclass)) {
		// we reached the very top of the inheritance chain
		superclassName = "sap.ui.core.webc.WebComponent";
	} else if (superclassName) {
		superclassName = `module:${classDef.superclass._ui5QualifiedNameSlashes}`;
	} else {
		logger.warn(`Superclass for class ${classDef._ui5QualifiedName} has no property 'name'`);
	}

	// TODO: The descriptions can contain non JSDoc compliant characters, e.g. `*` or `@`
	//       Looks like markdown(?)
	//       Should we escape those characters to avoid JSDoc parsing errors?
	//       Most texts don't make any sense though, they reference the web components by their tag
	//       and not by their class names.
	const description = classDef.description || "";

	// @implements
	const interfacesSlashed = classDef._ui5QualifiedInterfaceNamesSlashes ? classDef._ui5QualifiedInterfaceNamesSlashes.join(", ") : "";

	// @extends
	const extendsTag = superclassName ? superclassName : "";

	// @alias (we use this later also as the origin for methods and getters, e.g. my.project.thirdparty.webc.dist.Class#myMethod)
	classDef._jsDoc.alias = classDef._ui5QualifiedName;

	// and finally we template the class header preamble
	classDef._jsDoc.classHeader = Templates.classHeader({
		description,
		interfacesSlashed,
		extendsTag,
		aliasSlashed: classDef._ui5QualifiedNameSlashes,
		jsdocTags,
	});
}

/**
 * Serializes the UI5 metadata of a class' "entityType" including the JSDoc comments, e.g. "properties".
 * @param {WebComponentRegistryEntry.classDef} classDef A class definition from the custom elements manifest
 * @param {string} entityType the entity type, either: "properties", "aggregations", "associations", "events"
 */
function _prepareEntity(classDef, entityType) {
	const jsDoc = classDef._jsDoc;

	Object.keys(jsDoc[entityType]).forEach((entityName) => {
		const obj = jsDoc[entityType][entityName];
		// write the JSDoc comment back to the entity
		jsDoc[entityType][entityName] = baseTemplate({
			description: obj.description,
			// some entities (e.g. aggregations and associations) might have a module type
			alias: obj.moduleType ? `@type ${obj.moduleType}` : "",
		});
	});
}

/**
 * Prepares the JSDoc for each event defined on the given class.
 * Parameters will also be serialized.
 * @param {object} classDef the class definition from the custom elements manifest
 */
function _prepareEvents(classDef) {
	const ui5metadata = classDef._ui5metadata;
	const jsDoc = classDef._jsDoc;

	// we serialize the events one by one
	// they will be combined in the UI5Metadata HBS template later
	const metadataEvents = ui5metadata.events;
	Object.keys(metadataEvents).forEach((eventName) => {
		const event = metadataEvents[eventName];
		const eventJsDoc = jsDoc.events[eventName];
		const parametersJsDoc = eventJsDoc.parameters;

		// template parameters if any
		Object.keys(parametersJsDoc).forEach((paramName) => {
			const param = parametersJsDoc[paramName];
			parametersJsDoc[paramName] = baseTemplate({
				description: param.description,
			});
		});

		// final templating combining the event itself and all its parameters
		eventJsDoc.serializedJsDoc = Templates.event({
			eventName: eventName,
			description: eventJsDoc.description,
			parametersJsDoc,
			event,
		});
	});
}

/**
 * Prepares the JSDoc comments for all getters and methods of the given class.
 * @param {object} classDef the class definition from the custom elements manifest
 * @param {string} jsdocTags JSDoc tags
 */
function _prepareGettersAndMethods(classDef, jsdocTags) {
	const ui5metadata = classDef._ui5metadata;
	const jsDoc = classDef._jsDoc;

	// note: in the UI5 metadata "getters" is an array, in the jsDoc we key it with the name
	ui5metadata.getters.forEach((name) => {
		const getterDef = jsDoc.getters[name];
		getterDef.serializedJsDoc = Templates.methodsAndGetters({
			description: getterDef.description,
			// function names on the instance use the "#" syntax
			// the alias of the class is already escaped!
			alias: `${jsDoc.alias}#${getterDef.getterName}`,
			aliasSlashed: `${classDef._ui5QualifiedNameSlashes}#${getterDef.getterName}`,
			jsdocTags,
		});
	});

	// note: in the UI5 metadata "methods" is an array, in the jsDoc we key it with the name
	ui5metadata.methods.forEach((name) => {
		const methodDef = jsDoc.methods[name];
		methodDef.serializedJsDoc = Templates.methodsAndGetters({
			description: methodDef.description,
			parameters: methodDef.parameters,
			// function names on the instance use the "#" syntax
			// methods are taken as-is, unlike getters (s.a.)
			// the alias of the class is already escaped!
			alias: `${jsDoc.alias}#${name}`,
			aliasSlashed: `${classDef._ui5QualifiedNameSlashes}#${name}`,
			jsdocTags,
		});
	});
}

/**
 * Serializes the UI5 metadata of a class including the JSDoc comments.
 * @param {object} classDef the class definition from the custom elements manifest
 * @param {string} jsdocTags JSDoc tags
 */
function _prepareUI5Metadata(classDef, jsdocTags) {
	// The following metadata values are filled by the rollup plugin atm.
	// the tag specifically needs a scoping suffix

	// prepare simple metadata entities
	["properties", "aggregations", "associations"].forEach((entityType) => {
		_prepareEntity(classDef, entityType);
	});

	// serialize each event + its parameters
	_prepareEvents(classDef);

	// serialize getters and setters JSDoc comments
	_prepareGettersAndMethods(classDef, jsdocTags);
}

const JSDocSerializer = {
	/**
	 * Deactivates the generation of JSDoc comments.
	 */
	deactivate() {
		for (const s in this) {
			this[s] = () => {};
		}
	},

	/**
	 * Prepares the JSDoc for the given WebComponentRegistryEntry.
	 * @param {WebComponentRegistryEntry} registryEntry the registry entry for a web component package
	 */
	prepare(registryEntry) {
		// Classes (used in WrapperControl.hbs)
		Object.keys(registryEntry.classes).forEach((className) => {
			const classDef = registryEntry.classes[className];
			if (classDef.superclass) {
				// we track the serialized JSDoc independently from the class' ui5-metadata
				_serializeClassHeader(classDef, registryEntry.customJSDocTags);

				// the serialized metadata as a single string, can be inlined in the control wrappers later
				_prepareUI5Metadata(classDef, registryEntry.customJSDocTags);
			} else {
				// TODO: what do we do with the classes that don't have a superclass?
				logger.warn(`No superclass found for class ${classDef._ui5QualifiedName}`);
			}
		});

		// Package (used in Package.hbs)
		//   [1] interfaces
		Object.keys(registryEntry.interfaces).forEach((interfaceName) => {
			const interfaceDef = registryEntry.interfaces[interfaceName];
			const description = interfaceDef.description || interfaceDef.name;
			interfaceDef._jsDoc = baseTemplate({
				description: `${description}${description ? "\n" : ""}`,
				alias: `@name module:${interfaceDef._ui5QualifiedNameSlashes}`,
				entityType: "@interface",
				override: `@ui5-module-override ${registryEntry.namespace} ${interfaceName}`,
				additionalTags: registryEntry.customJSDocTags.map((tag) => `@${tag}`).join("\n"),
			});
		});

		//   [2] enums
		Object.keys(registryEntry.enums).forEach((enumName) => {
			const enumDef = registryEntry.enums[enumName];
			const description = enumDef.description || enumDef.name;
			// enum header comment
			enumDef._jsDoc = baseTemplate({
				description: `${description}${description ? "\n" : ""}`, // append newline if description is not empty
				entityType: "@enum {string}",
				additionalTags: registryEntry.customJSDocTags.map((tag) => `@${tag}`).join("\n"),
				alias: `@alias module:${enumDef._ui5QualifiedNameSlashes}`,
				override: `@ui5-module-override ${registryEntry.namespace} ${enumName}`,
			});
			enumDef.values.forEach((value) => {
				const description = value.description || value.name;
				value._jsDoc = baseTemplate({
					description: `${description}${description ? "\n" : ""}`, // append newline if description is not empty
					additionalTags: registryEntry.customJSDocTags.map((tag) => `@${tag}`).join("\n"),
				});
			});
		});
	},

	/**
	 * Initializes the class for tracking the serialized JSDoc comments.
	 * The JSDoc comments are tracked separately from the UI5 metadata as they are not part of the runtime.
	 * @param {object} classDef the class definition from the custom elements manifest
	 */
	initClass(classDef) {
		classDef._jsDoc = {
			classHeader: "",
			metadata: "",
			properties: {},
			aggregations: {},
			associations: {},
			events: {},
			getters: {},
			methods: {},
		};
	},

	/**
	 * Serializes the UI5 metadata of the given class.
	 * @param {WebComponentRegistryEntry.classDef} classDef A class definition from the custom elements manifest
	 * @param {ManagedObjectMetadata} metadata UI5 wrapper control metadata
	 * @returns
	 */
	serializeMetadata(classDef) {
		classDef._jsDoc.metadata = Templates.ui5metadata({
			jsDoc: classDef._jsDoc,
			metadata: classDef._ui5metadata,
			designtimeNamespace: dot2slash(classDef._ui5metadata.qualifiedNamespace),
			className: classDef.name,
		});
		return classDef._jsDoc.metadata;
	},

	/**
	 * Writes the a JSDoc comment into the given class definition based on the given entity infos.
	 * @param {object} classDef the class definition from the custom elements manifest
	 * @param {string} entityType a UI5 metadata entity, e.g. "properties"
	 * @param {object} entityDef the entity definition from the custom elements manifest
	 */
	writeDoc(classDef, entityType, entityDef) {
		// we clone the objects here to prevent accidental side effects
		classDef._jsDoc[entityType][entityDef.name] = Object.assign({}, entityDef);
	},
};

module.exports = JSDocSerializer;

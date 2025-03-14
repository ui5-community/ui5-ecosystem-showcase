const { join } = require("path");
const { readFileSync } = require("fs");

const handlebars = require("handlebars");

/**
 * Helper function to stringify objects into valid JSON from within HBS templates.
 * @param {object} context the object to stringify
 * @param {number} space the depth of the JSON stringification
 * @returns {string} the JSON string
 */
handlebars.registerHelper("json", function (context, space) {
	return JSON.stringify(context, null, space);
});

handlebars.registerHelper("escapeType", function (str) {
	return `{${str}}`;
});

/**
 * All needed HBS templates for serializing JSDoc comments.
 */
const Templates = {
	classHeader: loadAndCompileTemplate("../templates/jsdoc/ClassHeader.hbs"),
	basicComment: loadAndCompileTemplate("../templates/jsdoc/BasicComment.hbs"),
	ui5metadata: loadAndCompileTemplate("../templates/jsdoc/UI5Metadata.hbs"),
	event: loadAndCompileTemplate("../templates/jsdoc/Event.hbs"),
	methodsAndGetters: loadAndCompileTemplate("../templates/jsdoc/MethodsAndGetter.hbs"),
	enumHeader: loadAndCompileTemplate("../templates/jsdoc/EnumHeader.hbs"),
	enumValue: loadAndCompileTemplate("../templates/jsdoc/EnumValue.hbs"),
	interface: loadAndCompileTemplate("../templates/jsdoc/Interface.hbs"),
};

/**
 * helper function to load and compile a handlebars template
 */
function loadAndCompileTemplate(templatePath) {
	const templateFile = readFileSync(join(__dirname, templatePath), { encoding: "utf-8" });
	return handlebars.compile(templateFile);
}

/**
 * Converts slashes in a string to dots.
 * @param {string} s the slahed string
 * @returns {string} the dotted string
 */
function slash2dot(s) {
	return s.replace(/\//g, ".");
}

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
 */
function _serializeClassHeader(classDef) {
	// find superclass name, either another wrapper OR the core WebComponent base class
	let superclassName = classDef.superclass?._ui5metadata && classDef.superclass?.name;
	if (superclassName === "UI5Element") {
		// we reached the very top of the inheritance chain
		superclassName = "sap.ui.core.webc.WebComponent";
	} else if (superclassName) {
		let { namespace } = classDef.superclass._ui5metadata;
		namespace = slash2dot(namespace);
		superclassName = `${namespace}.${superclassName}`;
	} else {
		// TODO: what do we do with the classes that don't have a superclass?
		console.warn(`No superclass found for class ${classDef.name}`);
	}

	let { namespace } = classDef._ui5metadata;
	namespace = slash2dot(namespace);

	// TODO: The descriptions can contain non JSDoc compliant characters, e.g. `*` or `@`
	//       Looks like markdown(?)
	//       Should we escape those characters to avoid JSDoc parsing errors?
	//       Most texts don't make any sense though, they reference the web components by their tag
	//       and not by their class names.
	const description = `${classDef.description}`;

	// @extends
	const extendsTag = superclassName ? `${superclassName}` : "";

	// @alias (we use this later also for methods and getters)
	classDef._jsDoc.alias = `${namespace}.${classDef.name}`;

	// and finally we template the class header preamble
	classDef._jsDoc.classHeader = Templates.classHeader({
		description,
		extendsTag,
		alias: classDef._jsDoc.alias,
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
		jsDoc[entityType][entityName] = Templates.basicComment({
			description: obj.description,
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
			parametersJsDoc[paramName] = Templates.basicComment({
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
 */
function _prepareGettersAndMethods(classDef) {
	const ui5metadata = classDef._ui5metadata;
	const jsDoc = classDef._jsDoc;

	// note: in the UI5 metadata "getters" is an array, in the jsDoc we key it with the name
	ui5metadata.getters.forEach((name) => {
		const getterDef = jsDoc.getters[name];
		getterDef.serializedJsDoc = Templates.methodsAndGetters({
			description: getterDef.description,
			// function names on the instance use the "#" syntax
			alias: `${jsDoc.alias}#${getterDef.getterName}`,
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
			alias: `${jsDoc.alias}#${name}`,
		});
	});
}

/**
 * Serializes the UI5 metadata of a class including the JSDoc comments.
 * @param {object} classDef the class definition from the custom elements manifest
 */
function _prepareUI5Metadata(classDef) {
	// The following metadata values are filled by the rollup plugin atm.
	// the tag specifically needs a scoping suffix

	// prepare simple metadata entities
	["properties", "aggregations", "associations"].forEach((entityType) => {
		_prepareEntity(classDef, entityType);
	});

	// serialize each event + its parameters
	_prepareEvents(classDef);

	// serialize getters and setters JSDoc comments
	_prepareGettersAndMethods(classDef);
}

const JSDocSerializer = {
	/**
	 * Prepares the JSDoc for the given WebComponentRegistryEntry.
	 * @param {WebComponentRegistryEntry} registryEntry the registry entry for a web component package
	 */
	prepare(registryEntry) {
		// Classes (used in WrapperControl.hbs)
		Object.keys(registryEntry.classes).forEach((className) => {
			const classDef = registryEntry.classes[className];
			// we track the serialized JSDoc independently from the class' ui5-metadata
			_serializeClassHeader(classDef);

			// the serialized metadata as a single string, can be inlined in the control wrappers later
			_prepareUI5Metadata(classDef);
		});

		// Package (used in Package.hbs)
		//   [1] interfaces
		Object.keys(registryEntry.interfaces).forEach((interfaceName) => {
			const interfaceDef = registryEntry.interfaces[interfaceName];
			interfaceDef._jsDoc = Templates.interface({
				description: interfaceDef.description,
				alias: slash2dot(interfaceDef.prefixedName),
			});
		});

		//   [2] enums
		Object.keys(registryEntry.enums).forEach((enumName) => {
			const enumDef = registryEntry.enums[enumName];
			enumDef._jsDoc = Templates.enumHeader({
				description: enumDef.description,
				alias: slash2dot(enumDef.prefixedName),
			});
			enumDef.values.forEach((value) => {
				value._jsDoc = Templates.enumValue({ description: value.description });
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

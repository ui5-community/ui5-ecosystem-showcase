const { join } = require("path");
const { readFileSync } = require("fs");

const handlebars = require("handlebars");

const UI5MetadataEntities = {
	PROPERTIES: "properties",
	AGGREGATIONS: "aggregations",
	ASSOCIATIONS: "associations",
	EVENTS: "events",
	GETTERS: "getters",
	METHODS: "methods",
};

/**
 * Helper function to stringify objects into valid JSON from within HBS templates.
 */
handlebars.registerHelper("json", function (context) {
	return JSON.stringify(context);
});

/**
 * Helper function to retrieve a JSDoc comment the respective class and type, e.g. "properties".
 */
handlebars.registerHelper("jsDoc", function (jsDoc, entityType, entityName) {
	const base = jsDoc[entityType][entityName];
	return base;
});

/**
 * All needed HBS templates for serializing JSDoc comments.
 */
const Templates = {
	classHeader: loadAndCompileTemplate("../templates/jsdoc/ClassHeader.hbs"),
	ui5metadataEntity: loadAndCompileTemplate("../templates/jsdoc/UI5MetadataEntity.hbs"),
	ui5metadata: loadAndCompileTemplate("../templates/jsdoc/UI5Metadata.hbs"),
	event: loadAndCompileTemplate("../templates/jsdoc/UI5MetadataEvent.hbs"),
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
 * Renders the class header as a JSDoc comment.
 * @param {object} classDef the class definition from the custom elements manifest
 * @returns {string} the JSDoc comment for the class header
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

	// @alias
	const alias = `${namespace}.${classDef.name}`;

	const templatedHeader = Templates.classHeader({ description, extendsTag, alias });

	return templatedHeader;
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
		jsDoc[entityType][entityName] = Templates.ui5metadataEntity({
			description: obj.description,
		});
	});
}

// function _prepareEvents(classDef) {
// 	const ui5metadata = classDef._ui5metadata;
// 	const jsDoc = classDef._jsDoc;

// 	Object.keys(jsDoc[UI5MetadataEntities.EVENTS]).forEach((eventName) => {
// 		const event = jsDoc[UI5MetadataEntities.EVENTS][eventName];
// 		const jsDocEvent = Templates.event({ event, jsDoc });
// 	});
// }

/**
 * Serializes the UI5 metadata of a class including the JSDoc comments.
 * @param {object} classDef the class definition from the custom elements manifest
 */
function _prepareUI5Metadata(classDef) {
	// The following metadata values are filled by the rollup plugin
	// the tag specifically needs a scoping suffix
	// * tag
	// * library
	// * designtime

	// prepare simple metadata entities
	["properties", "aggregations", "associations"].forEach((entityType) => {
		_prepareEntity(classDef, entityType);
	});

	// prepare events
	// TODO: enable events
	// _prepareEvents(classDef);

	// TODO: enable serialize getters and setters JSDoc comments

	// only for debugging
	// call this in the rollup plugin after the metadata was enriched with tag, library etc.
	JSDocSerializer.serializeMetadata(classDef);
	const metadata = classDef._jsDoc.metadata;
	if (!metadata) {
		console.log(`JSDocSerializer: No metadata written for class '${classDef.name}'.`);
	}
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
			classDef._jsDoc.classHeader = _serializeClassHeader(classDef);

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
		// for events we receive a deeper object structure that is already correctly formatted
		if (entityType === UI5MetadataEntities.EVENTS) {
			classDef._jsDoc[entityType][entityDef.name] = entityDef;
		} else {
			// we unwrap the objects here to prevent accidental side effects
			classDef._jsDoc[entityType][entityDef.name] = { description: entityDef.description };
		}
	},
};

module.exports = JSDocSerializer;

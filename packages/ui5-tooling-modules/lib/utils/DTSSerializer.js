const { join } = require("path");
const { writeFileSync, readFileSync } = require("fs");

const handlebars = require("handlebars");
const WebComponentRegistryHelper = require("./WebComponentRegistryHelper");

handlebars.registerHelper("escapeInterfaceName", function (namespace, interfaceName) {
	const ui5QualifiedName = `${namespace}.${interfaceName}`;
	return `__implements_${ui5QualifiedName.replace(/[/.@-]/g, "_")}: boolean;`;
});

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
	imports = imports.replace(/,\s$/, `} from "${module}";`);
	return imports;
});

handlebars.registerHelper("join", function (array) {
	return array.join(", ");
});

/**
 * All needed HBS templates for serializing JSDoc comments.
 */
const Templates = {
	apiDocumentation: loadAndCompileTemplate("../templates/dts/ApiDocumentation.hbs"),
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
		writeFileSync(
			join(__dirname, "generated_types", `${registryEntry.qualifiedNamespace}.d.ts`),
			Templates.module({
				registryEntry,
			}),
			{ encoding: "utf-8" },
		);
		writeFileSync(
			join(__dirname, "generated_types", `${registryEntry.qualifiedNamespace}Classes.d.ts`),
			Templates.class({
				classes: registryEntry.classes,
			}),
			{ encoding: "utf-8" },
		);
	},
	initClass(classDef) {
		function generateSuperclassInfo(settings) {
			classDef._dts.imports[settings.module] ??= {};
			// TODO think about generating a fixed import name
			classDef._dts.imports[settings.module][settings.class] = { default: true };
			classDef._dts.imports[settings.module][`$${settings.class}Settings`] = {};
			classDef._dts.extends = settings.class;
		}

		classDef._dts = {
			imports: {},
			settings: {},
		};

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
			if (classDef._dts.implementsMarker) {
				classDef._dts.implements = classDef._dts.implementsMarker.map((interfaceDef) => interfaceDef.name);
				for (const interfaceDef of classDef._dts.implementsMarker) {
					classDef._dts.imports[interfaceDef.package] ??= {};
					classDef._dts.imports[interfaceDef.package][interfaceDef.name] = {};
				}
			}
			generateSuperclassInfo(superclassSettings);
		}
	},

	writeDts(classDef, entityType, entityDef) {
		// we clone the objects here to prevent accidental side effects
		classDef._dts[entityType][entityDef.name] = Object.assign({}, entityDef);
	},
};

module.exports = DTSSerializer;

const { join } = require("path");
const { writeFileSync, readFileSync } = require("fs");

const handlebars = require("handlebars");

handlebars.registerHelper("escapeInterfaceName", function (ui5QualifiedName) {
	return ui5QualifiedName.replace(/[.@-]/g, "_");
});

handlebars.registerHelper("generateApiDocumentation", function (description) {
	return description
		? Templates.apiDocumentation({
				description,
			})
		: "";
});

/**
 * All needed HBS templates for serializing JSDoc comments.
 */
const Templates = {
	apiDocumentation: loadAndCompileTemplate("../templates/dts/ApiDocumentation.hbs"),
	module: loadAndCompileTemplate("../templates/dts/Module.hbs"),
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
	},
};

module.exports = DTSSerializer;

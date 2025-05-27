const { join } = require("path");
const { readFileSync } = require("fs");

const handlebars = require("handlebars");

/**
 * All needed HBS templates for serializing JSDoc comments.
 */
const Templates = {
	// enumHeader: loadAndCompileTemplate("../templates/jsdoc/EnumHeader.hbs"),
	enums: loadAndCompileTemplate("../templates/dts/Enums.hbs"),
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
		console.log(
			Templates.enums({
				moduleName: registryEntry.namespace,
				enums: registryEntry.enums,
			}),
		);
	},
};

module.exports = DTSSerializer;

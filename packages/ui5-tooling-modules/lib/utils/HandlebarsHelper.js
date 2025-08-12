const handlebars = require("handlebars");
const { join } = require("path");
const { readFileSync } = require("fs");

// Below we register some Handlebars helpers that can be used in different templates

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

handlebars.registerHelper("formatNewLine", function (str) {
	return `${str.replace(/\n/g, "\n * ")}`;
});

handlebars.registerHelper("join", function (array) {
	return array.join(", ");
});

/**
 * This modules contains a bunch of Handlebars helpers, which can be shared across
 * different templates.
 */
const HandlebarsHelper = {
	/**
	 * helper function to load and compile a handlebars template
	 * @param {string} templatePath - The path to the Handlebars template file
	 * @returns {Function} - A compiled Handlebars template function
	 */
	loadAndCompile(templatePath) {
		const templateFile = readFileSync(join(__dirname, templatePath), { encoding: "utf-8" });
		return handlebars.compile(templateFile);
	},
};

module.exports = HandlebarsHelper;

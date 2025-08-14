const handlebars = require("handlebars");
const { join } = require("path");
const { readFileSync } = require("fs");

// ------------------------------ General Helpers -----------------------------------
// Below we register some Handlebars helpers that can be used in different templates
// ----------------------------------------------------------------------------------

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

// ---------------------------- JSDoc Templating ---------------------------------
// Below is a structured string template for generically rendering JSDoc comments.
// This template is used to create JSDoc comment blocks for the JSDocSerializer,
// as well as the DtsSerializer.
// -------------------------------------------------------------------------------

/**
 * Creates a template function that structures strings with placeholders.
 * @param {string[]} strings - Template string parts
 * @param {...string} keys - Keys for the placeholders
 * @returns {Function} Template function that accepts values for the placeholders
 */
function structureTemplate(strings, ...keys) {
	return (...values) => {
		const newLine = "\n *";
		const dict = values[values.length - 1] || {};
		const result = [`/**`];
		keys.forEach((key, i) => {
			const value = Number.isInteger(key) ? values[key] : dict[key];
			if (value) {
				value.split(/\n/).forEach((valueLine) => {
					result.push(`${newLine} `, valueLine);
				});
				result.push(strings[i + 1]);
				result.push(newLine);
			}
		});
		result.push("/");
		return result.length > 2 ? result.join("") : "";
	};
}

/**
 * Base template for generating standardized documentation blocks.
 * @type {Function}
 */
const baseTemplate = structureTemplate`${"text"}${"description"}${"defaultValue"}${"returnValue"}`;

/**
 * Register the helper that generates geneic JSDoc comment blocks.
 * For the most part we only need the description part from the base template.
 * @param {string} description - The description to be included in the JSDoc comment
 * @returns {string} - The generated JSDoc comment block
 */
handlebars.registerHelper("generateApiDocumentation", function (description) {
	return baseTemplate({ description });
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

	/**
	 * The generic base template for generating JSDoc comments.
	 * This template is very versatile and mainly used to generate different JSDoc comments
	 * in the DTSSerializer.
	 * The JSDocSerializer uses this template to generate description comments.
	 */
	baseTemplate,
};

module.exports = HandlebarsHelper;

const globals = require("globals");
const js = require("@eslint/js");
const jsdoc = require("eslint-plugin-jsdoc");

module.exports = [
	js.configs.recommended,
	jsdoc.configs["flat/recommended"],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				sap: "readonly",
			},
			ecmaVersion: 2023,
			sourceType: "script",
		},
	},
	{
		ignores: ["eslint.config.js"],
	},
];

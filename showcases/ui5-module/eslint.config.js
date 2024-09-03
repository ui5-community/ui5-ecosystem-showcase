const globals = require("globals");
const js = require("@eslint/js");

module.exports = [
	js.configs.recommended,
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

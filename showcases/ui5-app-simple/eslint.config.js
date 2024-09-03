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
		rules: {
			"no-undef": "warn",
			"no-unused-vars": "warn",
		},
	},
	{
		ignores: ["eslint.config.js"],
	},
];

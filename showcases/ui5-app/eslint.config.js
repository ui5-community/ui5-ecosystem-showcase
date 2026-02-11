const globals = require("globals");
const js = require("@eslint/js");
const jsdoc = require("eslint-plugin-jsdoc");
const mocha = require("eslint-plugin-mocha").default;
const wdio = require("eslint-plugin-wdio");

module.exports = [
	js.configs.recommended,
	{
		files: ["webapp/**"],
		...jsdoc.configs["flat/recommended"],
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
		files: ["webapp/test/e2e/**"],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.mocha,
				...wdio.configs["flat/recommended"].languageOptions.globals,
			},
			ecmaVersion: 2023,
			sourceType: "script",
		},
		plugins: {
			...mocha.configs.recommended.plugins,
			...wdio.configs["flat/recommended"].plugins,
		},
		rules: {
			...mocha.configs.recommended.rules,
			...wdio.configs["flat/recommended"].rules,
		},
	},
	{
		ignores: ["eslint.config.js"],
	},
];

import globals from "globals";
import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";

export default [
	js.configs.recommended,
	jsdoc.configs["flat/recommended"],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.commonjs,
				...globals.node,
				yo: "writable",
				confirm: "writable",
				map: "writable",
				input: "writable",
				sap: "readonly",
			},
			ecmaVersion: 2023,
			sourceType: "script",
		},
		rules: {
			"no-mixed-spaces-and-tabs": "warn",
			"jsdoc/tag-lines": "off",
		},
	},
	{
		ignores: [
			// ignore files for the following packages reusing this config
			"/packages/ui5-middleware-approuter/test/*/**",
			"/packages/ui5-tooling-modules/test/*/**",

			// config files
			"eslint.config.js",
			"eslint.config.mjs",
			"karma*.conf.js",
		],
	},
];

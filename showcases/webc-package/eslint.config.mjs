import eslint from "@eslint/js";
import globals from "globals";

export default [
	eslint.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			ecmaVersion: 2023,
			sourceType: "module",
		},
	},
	{
		ignores: ["eslint.config.mjs"],
	},
];

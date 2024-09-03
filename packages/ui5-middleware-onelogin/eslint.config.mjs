import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	{
		languageOptions: {
			globals: {
				...globals.node,
			},
			ecmaVersion: 2023,
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"prefer-const": "warn",
			"no-extra-boolean-cast": "warn",
			"no-var": "warn",
			"@typescript-eslint/ban-ts-comment": "warn",
			"@typescript-eslint/no-unsafe-assignment": "warn",
			"@typescript-eslint/no-unsafe-argument": "warn",
			"@typescript-eslint/no-require-imports": "warn",
			"@typescript-eslint/no-unsafe-member-access": "warn",
			"@typescript-eslint/no-unused-expressions": "warn",
			"@typescript-eslint/no-var-requires": "warn",
			"@typescript-eslint/no-inferrable-types": "warn",
			"@typescript-eslint/no-unused-vars": "warn",
			"@typescript-eslint/no-unsafe-call": "warn",
			"@typescript-eslint/no-floating-promises": "warn",
		},
	},
	{
		ignores: ["eslint.config.mjs", "assets/**", "lib/**", "sample/**", "**/*.spec.ts"],
	},
);

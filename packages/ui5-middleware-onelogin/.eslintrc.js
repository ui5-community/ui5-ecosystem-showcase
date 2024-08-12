/* eslint-disable @typescript-eslint/no-unsafe-assignment */
module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
	ignorePatterns: ["src/**/*.spec.ts"],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: ["./tsconfig.json"],
		tsconfigRootDir: __dirname,
		sourceType: "module",
	},
	plugins: ["@typescript-eslint"],
	rules: {
		"prefer-const": "warn",
		"no-extra-boolean-cast": "warn",
		"no-var": "warn",
		"@typescript-eslint/no-var-requires": "warn",
		"@typescript-eslint/ban-ts-comment": "warn",
		"@typescript-eslint/no-inferrable-types": "warn",
	},
};

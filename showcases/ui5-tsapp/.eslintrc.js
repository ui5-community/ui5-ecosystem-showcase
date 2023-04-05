/* eslint-disable @typescript-eslint/no-unsafe-assignment */
module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:@typescript-eslint/recommended-requiring-type-checking"],
	ignorePatterns: [".eslintignore.js", "**/*.js"],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: ["./tsconfig.json"],
		tsconfigRootDir: __dirname,
		sourceType: "module",
	},
	plugins: ["@typescript-eslint"],
};

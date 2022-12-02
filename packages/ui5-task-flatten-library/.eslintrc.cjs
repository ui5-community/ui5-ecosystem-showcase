module.exports = {
	parserOptions: {
		sourceType: "module",
	},
	env: {
		node: true,
		es2022: true,
	},
	extends: ["eslint:recommended"],
	ignorePatterns: [".eslintignore.js"],
	root: true,
};

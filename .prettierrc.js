module.exports = {
	// Make Prettier work with PNPM using JS config and require plugins
	// https://github.com/pnpm/pnpm/issues/3641
	plugins: Object.keys(require("./package").devDependencies)
		.filter((packageName) => {
			return packageName != "prettier" && packageName.includes("prettier");
		})
		.flatMap((packageName) => {
			return [require.resolve(packageName)];
		}),
	singleQuote: false,
	printWidth: 200,
	endOfLine: "lf",
	tabWidth: 4,
	useTabs: true,
	overrides: [
		{
			files: ["*.yaml", "*.yml", "*.md", "*.json", "*.xml", "*.properties"],
			options: {
				useTabs: false,
				tabWidth: 2,
				keySeparator: "=",
				xmlWhitespaceSensitivity: "ignore",
			},
		},
	],
};

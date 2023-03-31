// karma-ui5 usage: https://github.com/SAP/karma-ui5
module.exports = function (config) {
	config.set({
		frameworks: ["ui5"],
		browsers: ["Chrome"],
		// make Karma work with pnpm
		plugins: Object.keys(require("./package.json").devDependencies).flatMap((packageName) => (packageName.startsWith("karma-") ? [require(packageName)] : [])),
	});
};

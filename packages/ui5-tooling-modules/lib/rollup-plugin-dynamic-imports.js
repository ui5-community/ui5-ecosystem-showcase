module.exports = function ({ moduleName, keepDynamicImports } = {}) {
	keepDynamicImports = keepDynamicImports || [];
	return {
		name: "dynamic-imports",
		renderDynamicImport({ targetModuleId }) {
			if (!targetModuleId && keepDynamicImports.indexOf(moduleName) !== -1) {
				return {
					left: "import(",
					right: ")",
				};
			}
		},
	};
};

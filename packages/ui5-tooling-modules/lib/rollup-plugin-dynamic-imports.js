module.exports = function ({ moduleName, keepDynamicImports } = {}) {
	// by default the dynamic imports are kept (can be disabled with false or define a list of modules to keep)
	keepDynamicImports = keepDynamicImports === undefined ? true : keepDynamicImports;
	// if the value is an array, the module needs to be listed to keep the dynamic imports
	if (!typeof keepDynamicImports === "boolean" && Array.isArray(keepDynamicImports)) {
		keepDynamicImports = keepDynamicImports.indexOf(moduleName) !== -1;
	}
	// ensure to keep the dynamic import
	return {
		name: "dynamic-imports",
		renderDynamicImport({ targetModuleId }) {
			if (!targetModuleId && keepDynamicImports) {
				return {
					left: "import(",
					right: ")",
				};
			}
		},
	};
};

const { existsSync, readFileSync } = require("fs");

module.exports = function ({ findPackageJson, keepDynamicImports } = {}) {
	// ensure to keep the dynamic import
	return {
		name: "dynamic-imports",
		/*
		resolveDynamicImport(specifier, importer, { attributes } = {}) {
			const code = this.getModuleInfo(importer)?.code;
			if (code) {
				// get the import statement around the specifier
				const codeBeforeImport = code.substring(0, specifier.start);
				const importStatementStart = codeBeforeImport.lastIndexOf("(") + 1;
				const codeAfterImport = code.substring(specifier.end);
				const importStatementEnd = codeAfterImport.indexOf(")");
				const importStatement = code.substring(importStatementStart, specifier.end + importStatementEnd);
				// check for a / * webpackIgnore: true * / in the import statement ignoring whitespaces
				const hasIgnoreMarker = importStatement.match(/\/\*\s*webpackIgnore:\s*true\s*\*\//);
				if (hasIgnoreMarker) {
					return false;
				}
			}
			return null;
		},
		*/
		renderDynamicImport({ moduleId, targetModuleId /*, customResolution, format */ }) {
			// detect whether the dynamic import should be kept or not
			let keepDynamicImport = true;
			if (Array.isArray(keepDynamicImports)) {
				const pkgJsonFile = findPackageJson(moduleId);
				const pkgJson = existsSync(pkgJsonFile) ? JSON.parse(readFileSync(pkgJsonFile, { encoding: "utf8" })) : {};
				keepDynamicImport = keepDynamicImports.indexOf(pkgJson.name) !== -1;
			} else if (typeof keepDynamicImports === "boolean") {
				keepDynamicImport = keepDynamicImports;
			}
			// empty targetModuleId means it is a dynamic import using a variable and in this
			// case we keep it if the module is in the list or based on the boolean value
			if (!targetModuleId && keepDynamicImport) {
				return {
					left: "import(",
					right: ")",
				};
			}
			return null;
		},
	};
};

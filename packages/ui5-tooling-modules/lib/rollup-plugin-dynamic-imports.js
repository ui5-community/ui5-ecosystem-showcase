/**
 * Rollup plugin: control whether `import()` calls survive the bundle.
 *
 * By default rollup statically resolves dynamic imports and folds them into
 * the bundle. For UI5 apps that is rarely what you want — the runtime needs
 * to keep the original `import()` call so the UI5 loader can fetch the
 * resource on demand (and so apps can `import()` with a runtime variable).
 *
 * Hooks `renderDynamicImport` and decides per-import:
 *  - if `keepDynamicImports` is `true`, every dynamic import is preserved
 *  - if it is an array of package names, only imports whose owning package
 *    (looked up via `findPackageJson`) appears in the list are preserved
 *  - if it is `false`, rollup's default behaviour applies and the import is
 *    inlined / merged like any other static import
 *
 * Variable-form dynamic imports (where `targetModuleId` is empty) are also
 * preserved when the policy says so, since rollup cannot statically resolve
 * them anyway.
 *
 * @param {object} options plugin options
 * @param {(moduleId: string) => string} options.findPackageJson
 *        Returns the absolute path of the closest `package.json` for the
 *        given resolved module id. Used to look up the owning package name.
 * @param {boolean | string[]} [options.keepDynamicImports]
 *        Policy: `true` keeps all, `false` keeps none, an array keeps only
 *        the listed package names.
 * @returns {import('rollup').Plugin} configured rollup plugin
 */
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

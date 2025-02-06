// Inspired by https://rollupjs.org/plugin-development/#resolveid (the Polyfill Injection)
const PROXY_SUFFIX = "?inject-esmodule";
module.exports = function (/* { log } = {} */) {
	return {
		name: "inject-esmodule",
		async resolveId(source, importer, options) {
			if (options.isEntry) {
				// Determine what the actual entry would have been. We need
				// "skipSelf" to avoid an infinite loop.
				const resolution = await this.resolve(source, importer, {
					skipSelf: true,
					...options,
				});
				// If it cannot be resolved or is external, just return it
				// so that Rollup can display an error
				if (!resolution || resolution.external) return resolution;
				// In the load hook of the proxy, we need to know if the
				// entry has a default export. There, however, we no longer
				// have the full "resolution" object that may contain
				// meta-data from other plugins that is only added on first
				// load. Therefore we trigger loading here.
				const moduleInfo = await this.load(resolution);
				// We need to make sure side effects in the original entry
				// point are respected even for
				// treeshake.moduleSideEffects: false. "moduleSideEffects"
				// is a writable property on ModuleInfo.
				moduleInfo.moduleSideEffects = true;
				// It is important that the new entry does not start with
				// \0 and has the same directory as the original one to not
				// mess up relative external import generation. Also
				// keeping the name and just adding a "?query" to the end
				// ensures that preserveModules will generate the original
				// entry name for this entry.
				if (Object.keys(moduleInfo.attributes || {}).length === 0) {
					return {
						id: `${resolution.id}${PROXY_SUFFIX}`,
					};
				}
			}
			return null;
		},
		load(id) {
			if (id.endsWith(PROXY_SUFFIX)) {
				const entryId = id.slice(0, -PROXY_SUFFIX.length);
				// ModuleInfo.hasDefaultExport is used to determine if the module requires special handling
				let { hasDefaultExport } = this.getModuleInfo(entryId);
				let code = "";
				// namespace re-exports do not reexport default, so we need special handling here
				if (hasDefaultExport) {
					/*
					code += `import { default as defaultExport } from ${JSON.stringify(entryId)};\n`;
					// in some cases the default exports provides a default property
					// fetch-mock: ("export { index as default }" instead of "export default index")
					code += `const defaultExports = Object.assign({}, defaultExport?.default || defaultExport || { __emptyModule: true });\n`;
					// we also re-export the default export as "default" to ensure compatibility with _interopRequireDefault
					// which expects the "default" property to be present for CommonJS interop reasons
					code += `defaultExports.default = Object.assign({}, defaultExports);\n`;
					// we set the __esModule flag to true to indicate that this is an ES module
					code += `Object.defineProperty(defaultExports, "__" + "esModule", { value: true });\n`;
					// we freeze the object to disallow further modifications
					code += `debugger; export default Object.freeze(defaultExports);\n`;
					*/
					code += `import { default as defExp } from ${JSON.stringify(entryId)};\n`;
					// in some cases the default exports provides a default property
					// fetch-mock: ("export { index as default }" instead of "export default index")
					// other case like chart.js the default export is a function and we need to keep
					// it, so we only copy the properties from the defExp object if it is frozen
					code += `const defaultExports = Object.isFrozen(defExp) ? Object.assign({}, defExp?.default || defExp || { __emptyModule: true }) : defExp;\n`;
					// we also re-export the default export as "default" to ensure compatibility with _interopRequireDefault
					// which expects the "default" property to be present for CommonJS interop reasons
					// ==> NOT NEEDED ANYMORE AS WE HAVE A CONSISTENT __esModule addition for interopRequireDefault
					// code += `defaultExports.default = Object.assign({}, defExp);\n`;
					// we set the __esModule flag to true to indicate that this is an ES module
					code += `Object.defineProperty(defaultExports, "__" + "esModule", { value: true });\n`;
					// we freeze the object to disallow further modifications
					code += `export default Object.isFrozen(defExp) ? Object.freeze(defaultExports) : defaultExports;\n`;
				} else {
					// just re-export the module as is and set the __esModule flag to true
					code = `export * from ${JSON.stringify(entryId)};`;
					code += `export const __esModule = true ;\n`;
				}
				return code;
			}
			return null;
		},
	};
};

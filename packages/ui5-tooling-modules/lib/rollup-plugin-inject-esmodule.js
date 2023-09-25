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
				return `${resolution.id}${PROXY_SUFFIX}`;
			}
			return null;
		},
		load(id) {
			if (id.endsWith(PROXY_SUFFIX)) {
				const entryId = id.slice(0, -PROXY_SUFFIX.length);
				// We know ModuleInfo.hasDefaultExport is reliable because
				// we awaited this.load in resolveId
				const { hasDefaultExport } = this.getModuleInfo(entryId);
				let code = `export * from ${JSON.stringify(entryId)};`;
				// Namespace reexports do not reexport default, so we need
				// special handling here
				if (hasDefaultExport) {
					code += `import { default as defaultExport } from ${JSON.stringify(entryId)};`;
					code += `try { Object.defineProperty(defaultExport, "__" + "esModule", { value: true }); } catch (ex) {}`;
					code += `export default defaultExport;`;
				} else {
					code += `export const __esModule = true;`;
				}
				return code;
			}
			return null;
		},
	};
};

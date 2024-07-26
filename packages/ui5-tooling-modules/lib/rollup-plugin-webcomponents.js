// Inspired by https://rollupjs.org/plugin-development/#resolveid (the Polyfill Injection)
const SUFFIX = "?webcomponent";
module.exports = function (/* { log } = {} */) {
	return {
		name: "webcomponents",
		async resolveId(source, importer, options) {
			console.log("webcomponents:resolveId", arguments);
			if (source === "@ui5/webcomponents/dist/Button.js") {
				// Determine what the actual entry would have been. We need
				// "skipSelf" to avoid an infinite loop.
				const resolution = await this.resolve(source, importer, {
					skipSelf: true,
					...options,
				});
				return `${resolution.id}${SUFFIX}`;
			}
		},
		load(id) {
			console.log("webcomponents:load", arguments);
			if (id.endsWith(SUFFIX)) {
				const entryId = id.slice(0, -SUFFIX.length);
				// We know ModuleInfo.hasDefaultExport is reliable because
				// we awaited this.load in resolveId
				const { hasDefaultExport } = this.getModuleInfo(entryId);
				// Namespace reexports do not reexport default, so we need
				// special handling here
				if (hasDefaultExport) {
					let code = `import { default as defaultExport } from ${JSON.stringify(entryId)};`;
					code = `import WebComponent from "sap/ui/core/webc/WebComponent";`;
					code += `export default WebComponent.wrap(defaultExport);`;
					return code;
				} else {
					// should not happen
				}
			}
			return null;
		},
	};
};

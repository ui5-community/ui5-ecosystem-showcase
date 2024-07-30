const { join } = require("path");

// Inspired by https://rollupjs.org/plugin-development/#resolveid (the Polyfill Injection)
const SUFFIX = "?webcomponent";

const ceMetadatas = {};

module.exports = function ({ resolveModule } = {}) {
	return {
		name: "webcomponents",
		async resolveId(source, importer, options) {
			const npmPackageScopeRegEx = /^((?:(@[^/]+)\/)?([^/]+))(?:\/(.*))?$/;
			const npmPackage = npmPackageScopeRegEx.exec(source)?.[1];

			const packageJsonPath = resolveModule(`${npmPackage}/package.json`);
			if (packageJsonPath) {
				const packageJson = require(resolveModule(`${npmPackage}/package.json`));
				if (!ceMetadatas[npmPackage] && packageJson.customElements) {
					ceMetadatas[npmPackage] = require(resolveModule(join(npmPackage, packageJson.customElements)));
				}
			}

			console.log("webcomponents:resolveId", arguments, npmPackage);
			if (ceMetadatas[npmPackage]) {
				// Determine what the actual entry would have been. We need
				// "skipSelf" to avoid an infinite loop.
				const resolution = await this.resolve(source, importer, {
					skipSelf: true,
					...options,
				});
				return Object.assign({}, resolution, {
					id: `${resolution.id}${SUFFIX}`,
					attributes: {
						webcomponent: true,
						npmPackage,
					}
				});
			}
		},
		async load(id) {
			console.log("webcomponents:load", arguments);
			if (id.endsWith(SUFFIX)) {
				const entryId = id.slice(0, -SUFFIX.length);
				// We know ModuleInfo.hasDefaultExport is reliable because
				// we awaited this.load in resolveId
				//const { hasDefaultExport } = this.getModuleInfo(entryId);
				const moduleInfo = this.getModuleInfo(id);
				const { webcomponent, npmPackage } = moduleInfo.attributes;
				if (!webcomponent) {
					return null;
				}
				// Namespace reexports do not reexport default, so we need
				// special handling here
				let code = `import WebComponentClass from ${JSON.stringify(entryId)};`;
				// TODO: Identify parent class
				code += `import WebComponent from "sap/ui/core/webc/WebComponent";`;
				// TODO: WebComponent.extend
				code += `export default WebComponent.wrap(WebComponentClass);`;
				return code;
			}
			return null;
		},
	};
};

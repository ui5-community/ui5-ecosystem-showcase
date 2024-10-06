const path = require("path");
const { readFileSync } = require("fs");

module.exports = function () {
	return {
		name: "import-meta",
		transform: async function (code, id) {
			// find the URL constructor with import.meta.url as parameter
			const urlMatch = /new URL\(([^)]+)\)/.exec(code);
			if (urlMatch && urlMatch[1].trim().endsWith("import.meta.url")) {
				// extract the first parameter from the URL constructor
				let moduleId = urlMatch[1]
					.split(",")
					.map((s) => s.trim())
					.shift();
				// remove quotes (single or double)
				moduleId = moduleId.substring(1, moduleId.length - 1);
				// resolve the module
				const resolvedModule = await this.resolve(moduleId, id);
				if (resolvedModule) {
					// create a prebuilt chunk with the resolved module
					this.emitFile({
						type: "prebuilt-chunk",
						fileName: path.basename(resolvedModule.id),
						code: readFileSync(resolvedModule.id, { encoding: "utf8" }),
					});
					// replace the URL constructor with the prebuilt chunk
					return code.replace(urlMatch[1], `${JSON.stringify(path.basename(resolvedModule.id))}, import.meta.url`);
				}
			}
			return null;
		},
		resolveImportMeta(property, { /* moduleId, */ chunkId /*, format */ }) {
			if (property === "url") {
				// replace import.meta.url with the sap.ui.require.toUrl call
				const chunkModuleId = chunkId.substring(0, chunkId.length - path.extname(chunkId).length);
				return `new URL(sap.ui.require.toUrl("${chunkModuleId}"), document.baseURI).href`;
			}
			return null;
		},
	};
};

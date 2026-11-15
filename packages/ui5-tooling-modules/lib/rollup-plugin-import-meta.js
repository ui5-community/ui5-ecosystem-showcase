/**
 * Rollup plugin: handle `import.meta.url` and `new URL(..., import.meta.url)`.
 *
 * Two transformations:
 *
 * 1. `new URL("./asset.bin", import.meta.url)` — common pattern for shipping
 *    binary or text assets next to a module (e.g. maplibre-gl loading its
 *    worker bundle). The asset is resolved through the regular rollup
 *    resolver, emitted as a `prebuilt-chunk`, and the call is rewritten to
 *    reference the chunk's filename. `.mjs` and `.cjs` sources use a `.js`
 *    output suffix to match the downstream UI5 chunk/resource handling.
 *
 * 2. `import.meta.url` (bare) — replaced with a UI5-friendly equivalent
 *    `new URL(sap.ui.require.toUrl("<chunkModuleId>"), document.baseURI).href`
 *    so the bundled code resolves to the correct runtime URL through the
 *    UI5 module loader rather than relying on the host-page `<script>` URL.
 *
 * @returns {import('rollup').Plugin}
 */
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
					// remove the query parameter from the id
					let resolvedModuleId = resolvedModule.id;
					const queryIndex = resolvedModuleId.indexOf("?");
					if (queryIndex !== -1) {
						resolvedModuleId = resolvedModuleId.substring(0, queryIndex);
					}
					if (resolvedModuleId.startsWith("\0")) {
						resolvedModuleId = resolvedModuleId.substring(1);
					}
					// read the original source, but use a .js output suffix for JS chunks
					const fileName = path.basename(resolvedModuleId).replace(/\.(?:m|c)js$/i, ".js");
					this.emitFile({
						type: "prebuilt-chunk",
						fileName,
						code: readFileSync(resolvedModuleId, { encoding: "utf8" }),
					});
					// replace the URL constructor with the same filename as the emitted chunk
					return code.replace(urlMatch[1], `${JSON.stringify(fileName)}, import.meta.url`);
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

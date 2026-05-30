/**
 * Rollup plugin: handle import "instructions" encoded as query suffixes.
 *
 * Lets consumers ask rollup to import a resource in a non-default way by
 * appending an instruction query to the import specifier:
 *
 *  - `import url from "./logo.svg?url"`     → emits `export default sap.ui.require.toUrl(<filename>)`
 *  - `import css from "./styles.css?inline"` → emits `export default <file contents as string>`
 *
 * The query is preserved through `resolveId` (so the same physical file can
 * be imported with different instructions in the same bundle without
 * collision), `load` reads or labels the underlying file, and `transform`
 * produces the instruction-specific JS module.
 *
 * Currently supports `?url` and `?inline`. Anything else is left for other
 * plugins to interpret.
 *
 * @returns {import('rollup').Plugin}
 */
const { readFileSync } = require("fs");

module.exports = function () {
	return {
		name: "instructions",
		resolveId: async function (importee, importer) {
			let instruction = /(?:[^?]+)(\?.*)/.exec(importee)?.[1] || "";
			if (instruction) {
				importee = importee.replace(instruction, "");
				const resolvedId = await this.resolve(importee, importer, {
					skipSelf: true,
				});
				if (resolvedId) {
					if (instruction === "?url") {
						return `${importee}${instruction}`;
					}
					return `${resolvedId.id}${instruction}`;
				}
			}
		},
		load: function (id) {
			const segments = /([^?]+)(\?.*)/.exec(id);
			const file = segments?.[1];
			const instruction = segments?.[2];
			if (instruction) {
				if (instruction === "?url") {
					return file;
				}
				if (instruction === "?inline") {
					return readFileSync(file, "UTF-8");
				}
			}
		},
		transform: function (code, id) {
			let instruction = /(?:[^?]+)(\?.*)/.exec(id)?.[1] || "";
			if (instruction) {
				if (instruction === "?url") {
					return `export default sap.ui.require.toUrl(${JSON.stringify(code)});`;
				}
				if (instruction === "?inline") {
					return `export default ${JSON.stringify(code)};`;
				}
			}
		},
	};
};

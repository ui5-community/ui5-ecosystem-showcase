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

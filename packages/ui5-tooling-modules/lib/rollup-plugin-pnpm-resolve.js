const path = require("path");

module.exports = function ({ resolveModule } = {}) {
	return {
		name: "pnpm-resolve",
		resolveId: function (importee, importer) {
			let module = importee;
			if (path.isAbsolute(importee)) {
				// ignore absolute paths
				return null;
			} else if (importee.startsWith("./") || importee.startsWith("../")) {
				// resolve relative paths
				module = path.resolve(path.dirname(importer), importee);
			}
			// try to resolve the node module using the provided function
			const resolvedModule = resolveModule(module);
			//console.log(`Resolved ${importee} to ${resolvedModule}`);
			return resolvedModule;
		},
	};
};

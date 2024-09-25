const path = require("path");
const fs = require("fs");

const existsAndIsFile = function (file) {
	return fs.existsSync(file) && fs.statSync(file).isFile();
};

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
				//console.log(importee);
				if (existsAndIsFile(module)) {
					return module;
				} else if (existsAndIsFile(`${module}.js`)) {
					return `${module}.js`;
				} else if (existsAndIsFile(`${module}.cjs`)) {
					return `${module}.cjs`;
				} else if (existsAndIsFile(`${module}.mjs`)) {
					return `${module}.mjs`;
				}
			}
			// try to resolve the node module using the provided function
			const resolvedModule = resolveModule(module);
			//console.log(`Resolved ${importee} to ${resolvedModule}`);
			return resolvedModule;
		},
	};
};

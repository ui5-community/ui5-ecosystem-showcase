const path = require("path");
const fs = require("fs");

const existsAndIsFile = function (file) {
	return fs.existsSync(file) && fs.statSync(file).isFile();
};

module.exports = function ({ resolveModule } = {}) {
	return {
		name: "pnpm-resolve",
		resolveId: function (importee, importer) {
			if (path.isAbsolute(importee)) {
				// ignore absolute paths
				return null;
			} else if (importee.startsWith("./") || importee.startsWith("../")) {
				// resolve relative paths
				const file = path.resolve(path.dirname(importer), importee);
				if (existsAndIsFile(file)) {
					return file;
				} else if (existsAndIsFile(`${file}.js`)) {
					return `${file}.js`;
				} else if (existsAndIsFile(`${file}.cjs`)) {
					return `${file}.cjs`;
				} else if (existsAndIsFile(`${file}.mjs`)) {
					return `${file}.mjs`;
				}
			}
			// needs to be in sync with nodeResolve
			return resolveModule(importee);
		},
	};
};

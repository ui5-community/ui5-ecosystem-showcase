const path = require("path");
const fs = require("fs");
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
				if (fs.existsSync(file) && fs.statSync(file).isFile()) {
					return file;
				} else if (fs.existsSync(`${file}.js`)) {
					return `${file}.js`;
				} else if (fs.existsSync(`${file}.cjs`)) {
					return `${file}.cjs`;
				} else if (fs.existsSync(`${file}.mjs`)) {
					return `${file}.mjs`;
				}
			}
			// needs to be in sync with nodeResolve
			return resolveModule(importee);
		},
	};
};

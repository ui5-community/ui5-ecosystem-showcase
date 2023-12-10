const path = require("path");
module.exports = function ({ resolveModule } = {}) {
	return {
		name: "pnpm-resolve",
		resolveId(source) {
			// ignore absolute paths
			if (path.isAbsolute(source)) {
				return null;
			}
			// needs to be in sync with nodeResolve
			return resolveModule(source);
		},
	};
};

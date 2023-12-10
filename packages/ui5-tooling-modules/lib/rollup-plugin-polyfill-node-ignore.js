/* eslint-disable no-unused-vars */
module.exports = function ({ log } = {}) {
	const isBuiltInModule = function (module) {
		try {
			if (!require("path").isAbsolute(module) && require.resolve(module) === module) {
				return true;
			}
		} catch (ex) {
			/* */
		}
		return false;
	};
	return {
		name: "polyfill-node-ignore",
		resolveId: function (source) {
			if (isBuiltInModule(source)) {
				return { id: `${source}?polyfill-node-ignore`, moduleSideEffects: false };
			}
			return null;
		},
		load: function (source) {
			if (source.endsWith("?polyfill-node-ignore")) {
				return "";
			}
			return null;
		},
	};
};

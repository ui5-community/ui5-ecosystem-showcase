/* eslint-disable no-unused-vars */
module.exports = function ({ log, modules, extensions } = {}) {
	// we skip to transform CSS assets
	return {
		name: "skip-assets",
		load: function (source) {
			if (modules?.includes(source)) {
				log.verbose(`Skipping load for ${source}...`);
				return "";
			}
			return null;
		},
		transform: function (code, id) {
			if (extensions?.find((el) => id.endsWith(`.${el}`))) {
				log.verbose(`Skipping transform for ${id}...`);
				return "";
			}
		},
	};
};

/* eslint-disable no-unused-vars */
module.exports = function ({ log, modules, extensions } = {}) {
	// we skip to transform CSS assets
	return {
		name: "skip-assets",
		transform: function (code, id) {
			if (extensions?.find((el) => id.endsWith(`.${el}`))) {
				log.verbose(`Skipping transform for ${id}...`);
				return "";
			}
		},
	};
};

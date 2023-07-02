"use strict";

/* eslint-disable no-unused-vars */
module.exports = function (options = {}) {
	const log = options.log;
	// we skip to transform CSS assets
	return {
		name: "skip-assets",
		load: function (source) {
			if (options.modules?.includes(source)) {
				log.verbose(`Skipping load for ${source}...`);
				return "";
			}
			return null;
		},
		transform: function (code, id) {
			if (options.extensions?.find((el) => id.endsWith(`.${el}`))) {
				log.verbose(`Skipping transform for ${id}...`);
				return "";
			}
		},
	};
};

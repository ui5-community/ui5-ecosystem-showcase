/* eslint-disable no-unused-vars */
module.exports = function (options) {
	"use strict";

	// we skip to transform CSS assets
	return {
		name: "skip-assets",
		transform: function (code, id) {
			if (id && id.endsWith(".css")) {
				return "";
			}
		},
	};
};

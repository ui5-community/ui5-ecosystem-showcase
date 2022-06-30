"use strict";

// Inspired by https://github.com/piuccio/rollup-plugin-amd

const convert = require("@buxlabs/amd-to-es6");
const { createFilter } = require("@rollup/pluginutils");

const matchDefine = /\b(?:define)\b/;
const matchImport = /\b(import .*['"])(.*)(['"].*\n)/g;

module.exports = function (options = {}) {
	const filter = createFilter(options.include, options.exclude);
	return {
		name: "amd-custom",
		transform: function transform(code, id) {
			if (!filter(id)) return;
			if (!matchDefine.test(code)) return;

			let transformed = convert(code, options.converter);
			if (options.rewire) {
				transformed = transformed.replace(matchImport, (match, begin, moduleId, end) => {
					return `${begin}${options.rewire(moduleId, id) || moduleId}${end}`;
				});
			}

			return transformed;
		},
	};
};

// Inspired by https://github.com/piuccio/rollup-plugin-amd
// Necessary to use a newer version of the @buxlabs/amd-to-es6 package

const convert = require("@buxlabs/amd-to-es6");
const { createFilter } = require("@rollup/pluginutils");

const firstpass = /\b(?:define)\b/; // the detection of define is a bit to simple!
const importStatement = /\b(import .*['"])(.*)(['"].*\n)/g;

module.exports = function (options = {}) {
	options.converter = options.converter || {};
	// eslint-disable-next-line no-prototype-builtins
	options.converter.sourceMap = options.converter.hasOwnProperty("sourceMap") ? options.converter.sourceMap : true;

	const filter = createFilter(options.include, options.exclude);

	return {
		name: "amd-custom",

		transform: function transform(code, id) {
			if (!filter(id)) return;
			if (!firstpass.test(code)) return;

			try {
				let transformed = convert(code, options.converter);

				if (typeof transformed === "object") {
					transformed.code = transformed.source;
					delete transformed.source;
				}

				if (options.rewire) {
					if (typeof transformed === "object") {
						transformed.code = transformed.code.replace(importStatement, (match, begin, moduleId, end) => {
							return `${begin}${options.rewire(moduleId, id) || moduleId}${end}`;
						});
					} else {
						transformed = transformed.replace(importStatement, (match, begin, moduleId, end) => {
							return `${begin}${options.rewire(moduleId, id) || moduleId}${end}`;
						});
					}
				}

				return transformed;
			} catch (ex) {
				return;
			}
		},
	};
};

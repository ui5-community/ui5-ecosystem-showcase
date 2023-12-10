/* eslint-disable no-unused-vars */
const nodePolyfills = require("rollup-plugin-polyfill-node");
module.exports = function ({ log } = {}) {
	const { resolveId } = nodePolyfills();
	return {
		name: "polyfill-node-override",
		resolveId: function (importee, importer, options) {
			if (importee === "http2") {
				return { id: "http2?node-polyfill-override", moduleSideEffects: false };
			}
			if (importee === "async_hooks") {
				return { id: "async_hooks?node-polyfill-override", moduleSideEffects: false };
			}
			if (importee.startsWith("node:")) {
				return resolveId.call(this, importee.substr("node:".length), importer, options);
			}
			return null;
		},
		load: function (source) {
			if (source === "http2?node-polyfill-override") {
				return `export const constants = {
					HTTP2_HEADER_AUTHORITY: "authority",
					HTTP2_HEADER_METHOD: "method",
					HTTP2_HEADER_PATH: "path",
					HTTP2_HEADER_SCHEME: "scheme",
					HTTP2_HEADER_CONTENT_LENGTH: "content-length",
					HTTP2_HEADER_EXPECT: "expect",
					HTTP2_HEADER_STATUS: "status"
				};`;
			}
			if (source === "async_hooks?node-polyfill-override") {
				return `export class AsyncResource {};`;
			}
			return null;
		},
	};
};

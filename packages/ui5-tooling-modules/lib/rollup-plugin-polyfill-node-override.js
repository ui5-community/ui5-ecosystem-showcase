/* eslint-disable no-unused-vars */
const { existsSync, readFileSync } = require("fs");
const { join } = require("path");

// reuse logic from polyfill-node plugin
const nodePolyfills = require("rollup-plugin-polyfill-node");
const PREFIX = `\0polyfill-node.`;
const PREFIX_LENGTH = PREFIX.length;
const DIRNAME_PATH = "\0node-polyfills:dirname";
const FILENAME_PATH = "\0node-polyfills:filename";
const inject = require("@rollup/plugin-inject");

const isBuiltInModule = function isBuiltInModule(module) {
	try {
		if (!require("path").isAbsolute(module) && require.resolve(module) === module) {
			return true;
		}
	} catch (ex) {
		/* */
	}
	return false;
};

module.exports = function nodePolyfillsOverride({ log, cwd } = {}) {
	const { resolveId, load, transform } = nodePolyfills();
	const overridesDir = join(cwd, "_polyfill-overrides_");
	return {
		name: "polyfill-node-override",
		resolveId: function (importee, importer, options) {
			if (isBuiltInModule(importee)) {
				const builtInModule = importee.startsWith("node:") ? importee.substr("node:".length) : importee;
				if (existsSync(join(overridesDir, `${builtInModule}.js`))) {
					return { id: `${PREFIX}${builtInModule}.js`, moduleSideEffects: false };
				}
				const resolvedId = resolveId.call(this, builtInModule, importer, options);
				if (resolvedId) {
					return resolvedId;
				} else {
					return { id: `${builtInModule}?polyfill-node-ignore`, moduleSideEffects: false };
				}
			}
		},
		load: function (importee) {
			if (importee.startsWith(PREFIX)) {
				const builtInModule = importee.substr(PREFIX_LENGTH);
				let content;
				if (existsSync(join(overridesDir, `${builtInModule}`))) {
					content = readFileSync(join(overridesDir, `${builtInModule}`), { encoding: "utf8" });
				} else {
					content = load.apply(this, arguments);
				}
				return content;
			} else if (importee.endsWith("?polyfill-node-ignore")) {
				return "";
			}
			return null;
		},
	};
};

// prevent the renaming of global, process, Buffer in any module
// => needs to be used as a standalone rollup plugin in build
// !!!! KEEP IN SYNC WITH >> rollup-plugin-polyfill-node << !!!!
module.exports.inject = function nodePolyfillsOverrideInject() {
	return inject({
		process: PREFIX + "process",
		Buffer: [PREFIX + "buffer", "Buffer"],
		global: PREFIX + "global",
		__filename: FILENAME_PATH,
		__dirname: DIRNAME_PATH,
	});
};

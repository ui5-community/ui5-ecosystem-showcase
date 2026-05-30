/**
 * Rollup plugin: layered Node-builtin polyfill resolver.
 *
 * Wraps `rollup-plugin-polyfill-node` with a four-layer resolution chain
 * for `node:<x>` / bare-builtin imports:
 *
 *  1. Per-project escape hatch: `<cwd>/_polyfill-overrides_/<module>.js` is
 *     loaded verbatim if present. Use this for app-specific overrides
 *     that should not become workspace defaults.
 *  2. Centralized augmentation: `POLYFILL_AUGMENTATIONS[<module>]` is
 *     appended to the upstream polyfill source. Use this for small,
 *     workspace-wide patches (e.g. surfacing browser globals like
 *     `TextEncoder` / `TextDecoder` that the upstream `util` polyfill is
 *     missing). Tree-shaking removes the appended exports if nothing
 *     imports them by name, so registering augmentations is safe.
 *  3. Upstream `rollup-plugin-polyfill-node` polyfill set.
 *  4. Empty-module fallback (`?polyfill-node-ignore`) so unsupported
 *     builtins do not fail the bundle.
 *
 * The plugin also ships a companion {@link module.exports.inject} factory
 * which produces an `@rollup/plugin-inject` configured to swap `process`,
 * `Buffer`, `global`, `__filename`, `__dirname` references in user code
 * for the polyfilled equivalents — kept in sync with the upstream plugin.
 *
 * @param {object} options plugin options
 * @param {{ verbose?: (msg: string) => void }} [options.log] optional logger
 * @param {string} options.cwd
 *        project root used to locate `_polyfill-overrides_`
 * @param {string[]} [options.moduleNames]
 *        explicit entry-point names; entries here are NOT treated as
 *        Node builtins even if `require.resolve` would map them as such
 * @returns {import('rollup').Plugin} configured rollup plugin
 */
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

// Augmentations that get appended to the upstream rollup-plugin-polyfill-node
// polyfill source for a given Node built-in. Used to plug exports the
// upstream polyfill does not provide (typically WHATWG / Web-Platform APIs
// that exist as globals in the browser but only became `node:<module>` named
// exports in newer Node versions).
//
// Each entry is keyed by built-in module name and contains an ESM source
// snippet. The snippet is appended verbatim to the upstream polyfill source
// and may reference `globalThis.*`. Tree-shaking removes the appended
// exports from the final bundle when nothing imports them by name, so it is
// safe to register augmentations defensively.
const POLYFILL_AUGMENTATIONS = {
	// node:util gained TextEncoder/TextDecoder as named exports in Node 11
	// (Encoder) / 12 (Decoder). rollup-plugin-polyfill-node's `util.js` is
	// frozen at the legacy shape and does not expose them. Re-export the
	// browser globals so consumers that do `import {TextDecoder} from "util"`
	// (or destructure `require("util").TextDecoder`) resolve to a working
	// implementation in the bundled output.
	util: `
export const TextEncoder = globalThis.TextEncoder;
export const TextDecoder = globalThis.TextDecoder;
`,
};

const isBuiltInModule = function isBuiltInModule(module, entryPoints) {
	try {
		const isEntryPoint = entryPoints?.includes(module);
		if (!isEntryPoint && !require("path").isAbsolute(module) && require.resolve(module) === module) {
			return true;
		}
	} catch (ex) {
		/* ignore */
	}
	return false;
};

module.exports = function nodePolyfillsOverride({ log, cwd, moduleNames } = {}) {
	const { resolveId, load, transform } = nodePolyfills();
	const overridesDir = join(cwd, "_polyfill-overrides_");
	return {
		name: "polyfill-node-override",
		resolveId: function (importee, importer, options) {
			if (isBuiltInModule(importee, moduleNames)) {
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
					// Append any augmentations registered for this built-in
					// (e.g. TextEncoder/TextDecoder for `util`). The match key
					// is the module name without the trailing `.js`.
					const moduleKey = builtInModule.replace(/\.js$/, "");
					const augmentation = POLYFILL_AUGMENTATIONS[moduleKey];
					if (augmentation && typeof content === "string") {
						content += augmentation;
					}
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
module.exports.inject = function nodePolyfillsOverrideInject(additionalOptions) {
	return inject(
		Object.assign({}, additionalOptions, {
			process: PREFIX + "process",
			Buffer: [PREFIX + "buffer", "Buffer"],
			global: PREFIX + "global",
			__filename: FILENAME_PATH,
			__dirname: DIRNAME_PATH,
		}),
	);
};

/**
 * Rollup plugin: custom module resolution.
 *
 * Delegates id resolution to a `resolveModule` callback supplied by the
 * caller. The callback receives the request (a bare specifier like
 * `lodash/fp`, an absolute path the plugin lets through unchanged, or a
 * fully-resolved relative path) and returns the on-disk path that rollup
 * should load.
 *
 * Despite a previous filename of `rollup-plugin-pnpm-resolve.js`, the plugin
 * is **not pnpm-specific**. The hosting `ui5-tooling-modules` resolver
 * (`util.js#resolveModule`) walks the workspace's `node_modules` graph in a
 * package-manager-agnostic way and works the same for npm, yarn classic,
 * yarn berry's `node-modules` linker, and pnpm (both isolated and hoisted).
 * The previous name only reflected which package manager exercised the code
 * first; the resolution strategy itself never depended on pnpm internals.
 *
 * Behavior summary:
 *  - absolute paths       : passed through unchanged (rollup's own loaders win)
 *  - `./` / `../` paths   : resolved relative to the importer, then handed
 *                            to the callback as an absolute path
 *  - bare specifiers      : handed to the callback verbatim
 *
 * @param {object}   options
 * @param {(id: string) => string | null | undefined} options.resolveModule
 *        Callback that returns the resolved absolute file path for `id`,
 *        or a falsy value to let rollup fall through to its other resolvers.
 * @returns {import('rollup').Plugin}
 */
const path = require("path");

module.exports = function ({ resolveModule } = {}) {
	return {
		name: "resolve-module",
		resolveId: function (importee, importer) {
			let module = importee;
			if (path.isAbsolute(importee)) {
				// ignore absolute paths
				return null;
			} else if (importee.startsWith("./") || importee.startsWith("../")) {
				// resolve relative paths
				module = path.resolve(path.dirname(importer), importee);
			}
			// try to resolve the node module using the provided function
			const resolvedModule = resolveModule(module);
			//console.log(`Resolved ${importee} to ${resolvedModule}`);
			return resolvedModule;
		},
	};
};

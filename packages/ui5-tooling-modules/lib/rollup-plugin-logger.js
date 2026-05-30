/**
 * Rollup plugin: trace each resolveId / load / transform call to the logger.
 *
 * Pure observability — no behaviour change. Every hook returns `undefined`
 * so the call falls through to other plugins. Each line is prefixed with a
 * monotonically-increasing counter per hook so log output can be diffed
 * across runs to reason about plugin order and module-graph changes.
 *
 * @param {object} options plugin options
 * @param {{ verbose: (msg: string) => void }} [options.log]
 *        UI5 task / middleware logger. Calls are no-ops if `log` is missing.
 * @returns {import('rollup').Plugin} configured rollup plugin
 */
module.exports = function ({ log } = {}) {
	let c_r = 0,
		c_l = 0,
		c_t = 0;
	return {
		name: "logger",
		resolveId(importee, importer) {
			log?.verbose(`${c_r++} Bundling resource ${importee} from ${importer?.split("/").pop()}`);
			return undefined;
		},
		load(importee) {
			log?.verbose(`	${c_l++} Loading resource ${importee}`);
			return undefined;
		},
		transform(code, id) {
			log?.verbose(`	${c_t++} Transforming resource ${id}`);
			return undefined;
		},
	};
};

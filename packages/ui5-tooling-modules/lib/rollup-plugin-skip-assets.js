/**
 * Rollup plugin: short-circuit transformation of asset files by extension.
 *
 * For every module whose id ends in one of the configured extensions
 * (e.g. `css`), the `transform` hook returns an empty string so other
 * plugins (Babel, terser, ...) skip the file. The original asset is left
 * for the downstream UI5 build pipeline to copy verbatim.
 *
 * Use sparingly — anything returned here will not be re-emitted by rollup.
 *
 * @param {object} options plugin options
 * @param {{ verbose: (msg: string) => void }} [options.log] UI5 task / middleware logger
 * @param {string[]} options.extensions
 *        list of bare extensions to skip (without leading dot)
 * @returns {import('rollup').Plugin} configured rollup plugin
 */
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

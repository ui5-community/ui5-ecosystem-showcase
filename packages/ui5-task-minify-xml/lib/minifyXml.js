const { minimatch } = require("minimatch");

const defaultMinifyOptions = {
	collapseWhitespaceInAttributeValues: true,
};

const attrValueRegExp = /(?<=<\/?[^\s/>]+\b(?:\s+[^=\s>]+\s*=\s*(?:"[^"]*"|'[^']*'))*\s+[^\s=/>]+\s*=\s*(["']))[^\1]*?(?=\1)/g;

/**
 * Task to minify XML views, fragments, controls, etc.
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/logger/Logger} parameters.log Logger instance
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {object} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @param {string[]} [parameters.options.configuration.excludePatterns] Substring patterns; matching resources are excluded from minification (classic behavior)
 * @param {string[]} [parameters.options.configuration.includes] Glob patterns; when set, only resources matching at least one pattern are minified
 * @param {string[]} [parameters.options.configuration.excludes] Glob patterns; resources matching any pattern are excluded from minification
 * @returns {Promise<undefined>} Promise resolving with undefined once data has been written
 */
module.exports = async ({ log, workspace, options }) => {
	const config = options.configuration || {};

	// glob-based include/exclude patterns (aligned with ui5-task-zipper); the classic
	// substring-based `excludePatterns` is kept for backward compatibility
	const includes = config.includes || [];
	const excludes = config.excludes || [];

	// determine whether a resource should be minified based on the include/exclude globs
	// eslint-disable-next-line jsdoc/require-jsdoc
	function shouldMinifyResource(resourcePath) {
		// exclude wins: drop the resource if it matches any exclude glob
		if (excludes.some((glob) => minimatch(resourcePath, glob))) {
			return false;
		}
		// when includes are given, only keep resources matching at least one include glob
		if (includes.length > 0) {
			return includes.some((glob) => minimatch(resourcePath, glob));
		}
		return true;
	}

	const fileExtensions = Array.isArray(config.fileExtensions) ? config.fileExtensions : [config.fileExtensions || "xml"];
	const xmlResources = await workspace.byGlob(`**/*.+(${fileExtensions.join("|")})`);

	const { minify } = await import("minify-xml");

	await Promise.all(
		xmlResources.map(async (resource) => {
			// check if the resource should be excluded from minification (classic substring behavior)
			if (config.excludePatterns && config.excludePatterns.some((pattern) => resource.getPath().includes(pattern))) {
				return;
			}

			// check if the resource should be excluded from minification (glob-based includes/excludes)
			if (!shouldMinifyResource(resource.getPath())) {
				return;
			}

			// apply our defaults, the defaults of minify-xml will be applied by minify-xml in addition
			const minifyOptions = {
				...defaultMinifyOptions,
				...(options?.minifyOptions || {}),
			};

			// minify the XML file (fully standard compliant, the resulting XML
			// file will be semantically equal to the non-minified one)
			log.info("Minifying file " + resource.getPath());
			let xml = minify(await resource.getString(), minifyOptions);

			// collapse multiple spaces in attributes with one space (non-compliant,
			// but reducing multi-line attributes, such as JSON attributes to one line)
			if (minifyOptions.collapseWhitespaceInAttributeValues) {
				xml = xml.replace(attrValueRegExp, (value) => value.replace(/\s+/g, " "));
			}

			resource.setString(xml);
			await workspace.write(resource);
		}),
	);
};

/**
 * Callback function to define the list of required dependencies
 *
 * @returns {Promise<Set>}
 *      Promise resolving with a Set containing all dependencies
 *      that should be made available to the task.
 *      UI5 CLI will ensure that those dependencies have been
 *      built before executing the task.
 */
module.exports.determineRequiredDependencies = async function () {
	return new Set();
};

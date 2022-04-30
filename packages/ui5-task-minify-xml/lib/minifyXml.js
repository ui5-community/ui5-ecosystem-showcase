/* eslint-disable no-unused-vars, no-useless-escape */
const minify = require("minify-xml").minify;
const defaultMinifyOptions = {
	collapseWhitespaceInAttributeValues: true,
};

const attrValueRegExp = /(?<=<\/?[^\s\/>]+\b(?:\s+[^=\s>]+\s*=\s*(?:"[^"]*"|'[^']*'))*\s+[^\s=\/>]+\s*=\s*(["']))[^\1]*?(?=\1)/g;
const log = require("@ui5/logger").getLogger("builder:customtask:minifyxml");

/**
 * Task to minify XML views, fragments, controls, etc.
 *
 * @param {Object} parameters Parameters
 * @param {DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {Object} parameters.options Options
 * @param {string} parameters.options.projectName Project name
 * @param {string} [parameters.options.configuration] Task configuration if given in ui5.yaml
 * @returns {Promise<undefined>} Promise resolving with undefined once data has been written
 */
module.exports = async ({ workspace, dependencies, options }) => {
	const config = options.configuration || {};

	const fileExtensions = Array.isArray(config.fileExtensions) ? config.fileExtensions : [config.fileExtensions || "xml"];
	const xmlResources = await workspace.byGlob(`**/*.+(${fileExtensions.join("|")})`);

	await Promise.all(
		xmlResources.map(async (resource) => {
			// check if the resource should be excluded from minification
			if (config.excludePatterns && config.excludePatterns.some((pattern) => resource.getPath().includes(pattern))) {
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
		})
	);
};

/* eslint-disable no-unused-vars, no-undef */
const log = require("@ui5/logger").getLogger("builder:customtask:stringreplace");

const { createReplacePlaceholdersDestination, addPlaceholderString, readPlaceholderFromEnv, isPathOnContentTypeExcludeList } = require("./util");

/**
 * Task to replace strings from files
 *
 * @param {object} parameters Parameters
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {module:@ui5/fs.AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {object} parameters.options Options
 * @param {Array} parameters.options.files all file name patterns where replace should occur
 * @param {Array} [parameters.options.strings] Array of objects containing placeholder and replacment text value
 * @returns {Promise<undefined>} Promise resolving with undefined once data has been written
 */
module.exports = function ({ workspace, options }) {
	const isDebug = options.configuration && options.configuration.debug;

	// get all environment variables
	const prefix = options.configuration?.prefix ? options.configuration?.prefix : "UI5_ENV"; // default
	const placeholderStrings = readPlaceholderFromEnv(prefix, log);

	// extract the placeholder strings from the configuration
	options.configuration?.replace?.forEach((entry) => {
		addPlaceholderString(entry.placeholder, entry.value);
	});

	// check if we found any strings to replace and stop the build if no strings are found
	// (we don't want to finish build for production while missing strings intended to be included in the build)
	let hasStringsToReplace = Object.keys(placeholderStrings).length > 0;
	if (!hasStringsToReplace) {
		throw new Error(`No strings to replace provided either through the process environment or task config`);
	}

	return workspace
		.byGlob(options.configuration && options.configuration.files)
		.then((allResources) => {
			// replaces all files placeholder strings with replacement text values
			return allResources.map((resource) => {
				// never replace strings in these mime types
				if (isPathOnContentTypeExcludeList(resource.getPath())) {
					return resource;
				}

				// stream replacement only works for UTF-8 resources!
				let stream = resource.getStream();
				stream.setEncoding("utf8");
				stream = stream.pipe(createReplacePlaceholdersDestination(resource, isDebug, log));
				resource.setStream(stream);
				return resource;
			});
		})
		.then((processedResources) => {
			return Promise.all(
				processedResources.map((resource) => {
					return workspace.write(resource);
				})
			);
		})
		.catch((err) => {
			log.error(`Failed to replace strings. Please check file patterns and string placeholders. Initial Error ${err}`);
		});
};

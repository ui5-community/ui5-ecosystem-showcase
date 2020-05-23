const replaceStream = require("replacestream");
const log = require("@ui5/logger").getLogger(
  "builder:customtask:stringreplacer"
);

/**
 * Task to replace strings from files
 *
 * @param {Object} parameters Parameters
 * @param {DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {AbstractReader} parameters.dependencies Reader or Collection to read dependency files
 * @param {Object} parameters.options Options
 * @param {Array} parameters.options.files all file name patterns where replace should occur
 * @param {Array} [parameters.options.strings] Array of objects containing placeholder and replacment text value
 * @returns {Promise<undefined>} Promise resolving with undefined once data has been written
 */
module.exports = function ({ workspace, options }) {
  return workspace
    .byGlob(options.configuration.files)
    .then((allResources) => {
      // replaces all files placeholder strings with replacement text values
      return replaceStrings({
        resources: allResources,
        strings: options.configuration.strings,
      });
    })
    .then((processedResources) => {
      return Promise.all(
        processedResources.map((resource) => {
          return workspace.write(resource);
        })
      );
    });
};
/**
 * @param {Object} parameters Parameters
 * @param {Array} parameters.resources files
 * @param {Array} parameters.strings Array of objects containing placeholder and replacment text value
 */
replaceStrings = function ({ resources, strings }) {
  return Promise.all(
    resources.map((resource) => {
      let stream = resource.getStream();
      stream.setEncoding("utf8");

      strings.forEach((string) => {
        stream = stream.pipe(replaceStream(string.placeholder, string.value));
      });

      resource.setStream(stream);
      return resource;
    })
  );
};

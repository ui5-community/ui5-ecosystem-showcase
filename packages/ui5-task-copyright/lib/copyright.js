const fs = require("fs");

const { parse } = require("@typescript-eslint/typescript-estree");
const { XMLParser } = require("fast-xml-parser");

/**
 * Task to append a copyright header for TypeScript, JavaScript and XML files
 * @param {object} parameters Parameters
 * @param {module:@ui5/logger/Logger} parameters.log Logger instance
 * @param {module:@ui5/fs.DuplexCollection} parameters.workspace DuplexCollection to read and write files
 * @param {object} parameters.options Options
 * @returns {Promise<undefined>} Promise resolving with undefined once data has been written
 */
module.exports = async ({ log, workspace, options }) => {
	// disable task if no copyright is configured
	if (!options?.configuration?.copyright) {
		return Promise.resolve();
	}

	// determine the copyright and current year placeholders
	const { copyrightPlaceholder, currentYearPlaceholder } = Object.assign(
		{
			copyrightPlaceholder: "copyright",
			currentYearPlaceholder: "currentYear",
		},
		options.configuration
	);

	// create regular expressions for the placeholders
	const copyrightRegExp = new RegExp(`(?:\\$\\{${copyrightPlaceholder}\\}|@${copyrightPlaceholder}@)`, "g");
	const currentYearRegExp = new RegExp(`(?:\\$\\{${currentYearPlaceholder}\\}|@${currentYearPlaceholder}@)`, "g");

	// determine the actual copyright or default it
	let { copyright, excludePatterns } = Object.assign(
		{
			copyright: `\${${copyrightPlaceholder}}`,
		},
		options.configuration
	);

	// check if the file exists (if copyright is a file path)
	if (fs.existsSync(copyright)) {
		log.verbose(`Reading copyright from file ${copyright}...`);
		copyright = fs.readFileSync(copyright, "utf-8").trim();
	}

	// Replace optional placeholder ${currentYear} with the current year
	const copyrightString = copyright.replace(currentYearRegExp, new Date().getFullYear());

	// process the script resources
	const scriptResources = await workspace.byGlob(`**/*.+(ts|js)`);
	if (scriptResources.length > 0) {
		await Promise.all(
			scriptResources.map(async (resource) => {
				const resourcePath = resource.getPath();

				// check if the resource should be excluded
				if (excludePatterns && excludePatterns.some((pattern) => resourcePath.includes(pattern))) {
					return;
				}

				// detailed logging
				log.verbose("Processing file " + resourcePath);

				// read the resource and parse the code
				const code = await resource.getString();
				const ast = parse(code, {
					filePath: resourcePath,
					loc: true,
					range: true,
					comment: true,
				});

				// find the first comment that starts with "!" and has a copyright placeholder
				const copyrightComment = ast.comments.find((comment) => {
					return comment.type === "Block" && comment.value.startsWith("!") && copyrightRegExp.test(comment.value);
				});

				// preprend the comment or replace the copyight placeholder
				const copyrightForJS = copyrightString
					.split(/\r?\n/)
					.map((line) => line.trimEnd())
					.join("\n * ");
				if (!copyrightComment) {
					await resource.setString(`/*!\n * ${copyrightForJS}\n */\n${code}`);
				} else {
					await resource.setString(code.replace(copyrightRegExp, copyrightForJS));
				}

				// write the resource
				await workspace.write(resource);
			})
		);
	}

	// process the xml resources
	const xmlResources = await workspace.byGlob(`**/*.xml`);
	if (xmlResources.length > 0) {
		// use fast-xml-parser to parse the xml files (including comments)
		const parser = new XMLParser({
			commentPropName: "#comment",
		});
		await Promise.all(
			xmlResources.map(async (resource) => {
				const resourcePath = resource.getPath();

				// check if the resource should be excluded
				if (excludePatterns && excludePatterns.some((pattern) => resourcePath.includes(pattern))) {
					return;
				}

				// detailed logging
				log.verbose("Processing file " + resourcePath);

				// read the resource and parse the xml
				const code = await resource.getString();
				const xml = parser.parse(code);

				// preprend the comment or replace the copyight placeholder
				const copyrightForXML = copyrightString
					.split(/\r?\n/)
					.map((line) => line.trimEnd())
					.join("\n  ");
				if (!(xml["#comment"] && copyrightRegExp.test(xml["#comment"]))) {
					await resource.setString(`<!--\n  ${copyrightForXML}\n-->\n${code}`);
				} else {
					await resource.setString(code.replace(copyrightRegExp, copyrightForXML));
				}

				// write the resource
				await workspace.write(resource);
			})
		);
	}
};

/**
 * Callback function to define the list of required dependencies
 * @returns {Promise<Set>}
 *      Promise resolving with a Set containing all dependencies
 *      that should be made available to the task.
 *      UI5 Tooling will ensure that those dependencies have been
 *      built before executing the task.
 */
module.exports.determineRequiredDependencies = async function () {
	return new Set();
};

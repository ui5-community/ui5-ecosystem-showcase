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
	if (!options?.configuration?.copyright && !process.env.ui5_task_copyright__file && !process.env.ui5_task_copyright__copyright) {
		return Promise.resolve();
	}

	// determine the copyright and current year placeholders
	let { copyrightPlaceholder, currentYearPlaceholder, currentYear } = Object.assign(
		{
			copyrightPlaceholder: "copyright",
			currentYearPlaceholder: "currentYear",
			currentYear: new Date().getFullYear(),
		},
		options.configuration,
	);

	// the environment variable UI5_TASK_COPYRIGHT_PLACEHOLDER_* can be used to override the placeholders
	if (process.env.ui5_task_copyright__placeholder_copyright) {
		copyrightPlaceholder = process.env.ui5_task_copyright__placeholder_copyright;
		log.info(`Using environment variable ui5_task_copyright__placeholder_copyright: ${copyrightPlaceholder}`);
	}
	if (process.env.ui5_task_copyright__placeholder_current_year) {
		currentYearPlaceholder = process.env.ui5_task_copyright__placeholder_current_year;
		log.info(`Using environment variable ui5_task_copyright__placeholder_current_year: ${currentYearPlaceholder}`);
	}

	// only words are allowed as placeholders
	if (!/^\w+$/.test(copyrightPlaceholder)) {
		throw new Error(`Invalid copyright placeholder: ${copyrightPlaceholder}`);
	}
	if (!/^\w+$/.test(currentYearPlaceholder)) {
		throw new Error(`Invalid currentYear placeholder: ${currentYearPlaceholder}`);
	}

	// escape the placeholder strings for safe usage in regular expressions
	const escapeStringForRegExp = function escapeStringForRegExp(string) {
		return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
	};
	copyrightPlaceholder = escapeStringForRegExp(copyrightPlaceholder);
	currentYearPlaceholder = escapeStringForRegExp(currentYearPlaceholder);

	// create regular expressions for the placeholders
	const copyrightRegExp = new RegExp(`(?:\\$\\{${copyrightPlaceholder}\\}|@${copyrightPlaceholder}@)`, "g");
	const currentYearRegExp = new RegExp(`(?:\\$\\{${currentYearPlaceholder}\\}|@${currentYearPlaceholder}@)`, "g");

	// determine the actual copyright or default it
	let { copyright, excludePatterns } = Object.assign(
		{
			copyright: process.env.ui5_task_copyright__copyright || `\${${copyrightPlaceholder}}`,
		},
		options.configuration,
	);

	// the environment variable ui5_task_copyright__file can be used to specify a file path for the copyright
	if (process.env.ui5_task_copyright__file) {
		copyright = process.env.ui5_task_copyright__file;
		log.info(`Using environment variable ui5_task_copyright__file: ${copyright}`);
	}

	// check if the file exists (if copyright is a file path)
	if (fs.existsSync(copyright)) {
		log.verbose(`Reading copyright from file ${copyright}...`);
		copyright = fs.readFileSync(copyright, "utf-8").trim();
	}

	// the environment variable ui5_task_copyright__current_year can be used to specify the copyright year
	if (process.env.ui5_task_copyright__current_year) {
		currentYear = process.env.ui5_task_copyright__current_year;
		log.info(`Using environment variable ui5_task_copyright__current_year: ${currentYear}`);
	}

	// Replace optional placeholder ${currentYear} with the current year
	const copyrightString = copyright.replace(currentYearRegExp, currentYear);

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
			}),
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
					const copyrightString = `<!--\n  ${copyrightForXML}\n-->`;
					// split the xml into the xml declaration and the content
					const parts = /(<\?xml.*\?>\s*)?([\s\S]*)/.exec(code);
					if (parts?.length === 3 && typeof parts[1] === "string") {
						// copyright comment is inserted after the xml declaration and before the content
						await resource.setString(`${parts[1].trim()}\n${copyrightString}\n${parts[2]?.trim() || ""}`);
					} else {
						// no xml declaration found
						await resource.setString(`${copyrightString}\n${code}`);
					}
				} else {
					await resource.setString(code.replace(copyrightRegExp, copyrightForXML));
				}

				// write the resource
				await workspace.write(resource);
			}),
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

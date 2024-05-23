/* eslint-disable no-unused-vars */
const path = require("path");
const fs = require("fs");
const serveStatic = require("serve-static");

require("dotenv").config();

const envOptionRegEx = /^\${env\.(.*)}$/;

/**
 * Parses the configuration option. If a ${env.<PARAM>} pattern is detected,
 * the corresponding .env-file value will be retrieved. Otherwise the
 * original value will be returned
 *
 * @param {string} optionValue the entered config option
 * @returns {string|*} the config option value
 */
const parseConfigOption = (optionValue) => {
	if (!optionValue) {
		return undefined;
	}
	if (envOptionRegEx.test(optionValue)) {
		const envVariable = optionValue.match(envOptionRegEx)[1];
		return process.env[envVariable];
	} else {
		return optionValue;
	}
};

/**
 * Custom UI5 Server middleware example
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.options Options
 * @param {object} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {Function} Middleware function to use
 */
module.exports = function ({ log, options }) {
	const effectiveConfig = Object.assign({}, options?.configuration);

	// determine the root path
	let rootPath = parseConfigOption(effectiveConfig.rootPath);

	// if no rootPath is given, we first check if an npm package path is given
	if (!rootPath) {
		// derive the scope and package name from the package name
		const npmPackageScopeRegEx = /^(?:(@[^/]+)\/)?([^/]+)\/(.*)$/;
		let npmPackagePath = parseConfigOption(effectiveConfig.npmPackagePath);
		const parts = npmPackageScopeRegEx.exec(npmPackagePath);
		if (parts) {
			const scope = parts[1];
			const packageName = parts[2];
			const packagePath = parts[3];
			try {
				const packageRoot = require.resolve(`${scope ? `${scope}/` : ""}${packageName}/package.json`);
				rootPath = path.join(path.dirname(packageRoot), packagePath);
			} catch (error) {
				log.error(`Could not resolve npm package path ${npmPackagePath}`);
			}
		}
	}

	// if still no rootPath is given, we throw an error
	if (!rootPath) {
		throw new Error(`No value for 'rootPath' supplied! Please provide a 'rootPath' or 'npmPackagePath' in the configuration!`);
	}
	// if the rootPath does not exist, we throw an error
	if (!fs.existsSync(rootPath)) {
		throw new Error(`The 'rootPath' ${rootPath} does not exist!`);
	}

	// resolve the rootPath to be absolute (should happen in serveStatic already, but used for logging)
	rootPath = path.resolve(rootPath);

	// some logging to see the root path in case of issues
	options.configuration.debug ? log.info(`Starting static serve from ${rootPath}`) : null;
	return serveStatic(rootPath);
};

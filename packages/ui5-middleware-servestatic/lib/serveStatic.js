/* eslint-disable no-unused-vars */
const path = require("path");
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
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {Function} Middleware function to use
 */
module.exports = function ({ log, options }) {
	let rootPath = parseConfigOption(options.configuration.rootPath);
	if (!rootPath) {
		throw new Error(`No Value for 'rootPath' supplied`);
	}
	// resolve the rootPath to be absolute (should happen in serveStatic already, but used for logging)
	rootPath = path.resolve(rootPath);
	// some logging to see the root path in case of issues
	options.configuration.debug ? log.info(`Starting static serve from ${rootPath}`) : null;
	return serveStatic(rootPath);
};

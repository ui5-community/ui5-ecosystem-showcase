/* eslint-disable no-unused-vars */
const browserSync = require("browser-sync");
const fs = require("fs");
const inject = require("./inject");
const path = require("path");

// read in UI5 "enhancements" that enable syncing click actions
// browsersync only syncs "clicks", but e.g. no "taps"
const customUI5Html = fs.readFileSync(path.join(`${__dirname}`, "ui5mangler.html"), { encoding: "utf-8" });

/**
 * @typedef {object} [configuration] configuration
 * @property {string} httpModule - capability to e.g. use `http2`
 * @property {string|yo<input|3000>} [port] port to run middleware at
 * @property {string|yo<confirm|true>} [logConnections] show connected browsers
 * @property {boolean|yo<confirm|false>} [https] whether to use the middleware via SSL/wss
 * @property {boolean|yo<confirm|false>} [debug] see output
 */

/**
 * Custom UI5 Server middleware example
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.options Options
 * @param {object} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {Function} Middleware function to use
 */
module.exports = ({ log, options }) => {
	const port = options?.configuration?.port || 3000;
	const bs = browserSync.create().init(
		{
			logSnippet: false,
			https: options?.configuration?.https || false,
			// http2 here, e.g. from UI5 CLI
			httpModule: options?.configuration?.httpModule,
			logLevel: options?.configuration?.debug ? "debug" : "info",
			// per default, log connections
			logConnections: options?.configuration?.logConnections || true,
			notify: false,
			open: false,
			port: port,
			socket: {
				port: port,
			},
			ui: false,
		},
		(err, instance) => {
			log.info(`started on port ${port}`);
		},
	);
	return inject(bs, {}, customUI5Html);
};

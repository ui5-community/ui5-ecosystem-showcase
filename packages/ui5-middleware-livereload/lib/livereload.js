/* eslint-disable no-unused-vars, no-undef */
const connectLivereload = require("connect-livereload");
const livereload = require("livereload");
const path = require("path");
const log = require("@ui5/logger").getLogger("server:custommiddleware:livereload");
const portfinder = require("portfinder");

/**
 * @typedef {Object} [configuration] configuration
 * @property {string|yo<input|xml,json,properties>} extraExts - file extensions other than `js`, `html` and `css` to monitor for changes
 * @property {string|yo<input|35729>} [port] - an open port choosen the live reload server is started on
 * @property {string|yo<input|webapp>} [watchPath] path inside `$yourapp` the reload server monitors for changes
 * @property {string} [exclusions] one or many `regex`. By default, this includes `.git/`, `.svn/`, and `.hg/`
 * @property {boolean|yo<confirm|false>} [debug] see output
 */

/**
 * Parses the configuration option. If the port passed then it returns with it.
 * If not passed it returns with the following free port after the deafult port.
 *
 * @param {object} options the entered config option
 * @param {number} defaultPort the port which is defaulted
 * @returns {number} a port which is free
 */
const getPortForLivereload = async (options, defaultPort) => {
	if (options.configuration && options.configuration.port) {
		return options.configuration.port;
	}
	try {
		portfinder.basePort = defaultPort;
		return await portfinder.getPortPromise();
	} catch {
		return defaultPort;
	}
};

/**
 * Custom UI5 Server middleware example
 *
 * @param {object} parameters Parameters
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {Function} Middleware function to use
 */
module.exports = async ({ resources, options }) => {
	let port = await getPortForLivereload(options, 35729);
	let watchPath = "webapp";
	// due to compatibility reasons we keep the path as watchPath (watchPath has higher precedence than path)
	if (options.configuration && (options.configuration.watchPath || options.configuration.path)) {
		watchPath = options.configuration.watchPath || options.configuration.path;
	}
	let exclusions = [];
	let aOptExclusions;
	if (options.configuration && options.configuration.exclusions) {
		aOptExclusions = options.configuration.exclusions;
	}
	if (options.configuration && aOptExclusions && Array.isArray(aOptExclusions)) {
		// multilpe exclusions
		aOptExclusions.forEach((exclusion) => {
			exclusions.push(new RegExp(exclusion));
		});
	} else if (options.configuration && aOptExclusions) {
		// single exclusion
		exclusions.push(new RegExp(aOptExclusions));
	}
	let extraExts = "xml,json,properties";
	if (options.configuration && options.configuration.extraExts) {
		extraExts = options.configuration.extraExts;
	}
	let debug = false;
	if (options.configuration && options.configuration.debug) {
		debug = options.configuration.debug;
	}

	let serverOptions = {
		debug: debug,
		extraExts: extraExts ? extraExts.split(",") : undefined,
		port: port,
		exclusions: exclusions,
	};

	const cli = require("yargs");
	if (cli.argv.h2) {
		const os = require("os");
		const fs = require("fs");

		sslKeyPath = cli.argv.key ? cli.argv.key : path.join(os.homedir(), ".ui5", "server", "server.key");
		sslCertPath = cli.argv.cert ? cli.argv.cert : path.join(os.homedir(), ".ui5", "server", "server.crt");
		debug ? log.info(`Livereload using SSL key ${sslKeyPath}`) : null;
		debug ? log.info(`Livereload using SSL certificate ${sslCertPath}`) : null;

		serverOptions.https = {
			key: fs.readFileSync(sslKeyPath),
			cert: fs.readFileSync(sslCertPath),
		};
	}

	const livereloadServer = livereload.createServer(serverOptions, () => {
		log.info("Livereload server started!");
	});

	if (Array.isArray(watchPath)) {
		let watchPaths = [];
		for (let i = 0; i < watchPath.length; i++) {
			watchPaths.push(path.join(process.cwd(), watchPath[i]));
		}
		debug ? log.info(`Livereload connecting to port ${port} for paths ${watchPaths}`) : null;
		livereloadServer.watch(watchPaths);
	} else {
		debug ? log.info(`Livereload connecting to port ${port} for path ${watchPath}`) : null;
		livereloadServer.watch(path.join(process.cwd(), watchPath));
	}

	// connect-livereload already holds the
	// method sig (req, res, next)
	return connectLivereload({
		port: port,
	});
};

/* eslint-disable no-unused-vars, no-undef */
const path = require("path");
const fs = require("fs");
const portfinder = require("portfinder");
const chokidar = require("chokidar");
// eslint-disable-next-line no-redeclare
const WebSocket = require("ws");

/**
 * @typedef {object} [configuration] configuration
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
 * Determines the source paths of the given resource collection recursivly.
 *
 * <b>ATTENTION: this is a hack to be compatible with UI5 tooling 2.x and 3.x</b>
 *
 * @param {module:@ui5/fs.AbstractReader} collection Reader or Collection to read resources of the root project and its dependencies
 * @returns {string[]} source paths
 */
const determineSourcePaths = (collection, skipFwkDeps) => {
	const fsPaths = [];
	collection?._readers?.forEach((_reader) => {
		fsPaths.push(...determineSourcePaths(_reader, skipFwkDeps));
	});
	const projectId = collection?._project?.id ?? collection?._project?.__id;
	if (!skipFwkDeps || !/^@(open|sap)ui5\/.*/g.test(projectId)) {
		if (collection?._project?._type === "application") {
			fsPaths.push(path.resolve(collection._project._modulePath, collection._project._webappPath));
		} else if (typeof collection?._fsBasePath === "string") {
			fsPaths.push(collection._fsBasePath);
		}
	}
	return fsPaths;
};

/**
 * Custom UI5 Server middleware example
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {object} parameters.options Options
 * @param {object} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a MiddlewareUtil instance
 * @returns {Function} Middleware function to use
 */
module.exports = async ({ log, resources, options, middlewareUtil }) => {
	const cwd = middlewareUtil.getProject().getRootPath() || process.cwd();
	let port = await getPortForLivereload(options, 35729);

	// due to compatibility reasons we keep the path as watchPath (watchPath has higher precedence than path)
	let watchPath = options?.configuration?.watchPath || options?.configuration?.path;
	// determine all watchpaths from project resources if not predefined
	if (!watchPath) {
		watchPath = determineSourcePaths(resources.all, !options.configuration?.includeFwkDeps);
		if (options.configuration?.includeAppDeps) {
			// applications are not detected as they are excluded from project dependencies
			// so we need to manually lookup the source directories for the applications
			const pkgJson = require(path.join(cwd, "package.json"));
			const deps = [];
			deps.push(...Object.keys(pkgJson.dependencies || {}));
			deps.push(...Object.keys(pkgJson.devDependencies || {}));
			//deps.push(...Object.keys(pkgJson.peerDependencies || {}));
			//deps.push(...Object.keys(pkgJson.optionalDependencies || {}));
			deps.forEach((dep) => {
				try {
					const depPath = path.dirname(
						require.resolve(`${dep}/ui5.yaml`, {
							paths: [cwd],
						}),
					);
					const webappPath = path.join(depPath, "webapp");
					if (fs.existsSync(webappPath)) {
						if (watchPath.indexOf(webappPath) === -1) {
							watchPath.push(webappPath);
						}
					} else {
						debug && log.warn(`The dependency "${dep}" has no "webapp" folder. Ignore for livereload...`);
					}
				} catch (e) {
					// we ignore error, as those dependencies are no UI5 apps
				}
			});
		}
	}

	let exclusions = options?.configuration?.exclusions;
	if (Array.isArray(exclusions)) {
		exclusions = exclusions.map((exclusion) => {
			return new RegExp(exclusion);
		});
	} else if (exclusions) {
		exclusions = [new RegExp(exclusions)];
	}
	let extraExts = options?.configuration?.extraExts || "js,html,css,jsx,ts,tsx,xml,json,properties";
	let debug = options?.configuration?.debug;
	let usePolling = options?.configuration?.usePolling;

	// Set up WebSocket server
	const wss = new WebSocket.Server({ port });
	wss.on("connection", (ws) => {
		debug && log.info("WebSocket client connected");
	});

	// Build array of file extensions to watch
	const extsToWatch = extraExts.split(",");

	// Prepare glob patterns for chokidar
	const globPatterns = extsToWatch.map((ext) => `**/*.${ext}`);

	// Set up chokidar watcher
	const watcher = chokidar.watch(watchPath, {
		ignored: exclusions,
		ignoreInitial: true,
		usePolling: usePolling,
		cwd: cwd,
		followSymlinks: true,
		depth: Infinity,
	});

	watcher.on("all", (event, filePath) => {
		debug && log.info(`File ${event}: ${filePath}`);
		// Notify all connected clients to reload
		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send("reload");
			}
		});
	});

	// Middleware function to inject the client-side script
	return (req, res, next) => {
		// Only inject into HTML responses
		if (res._livereloadInjected) {
			return next();
		}

		// Intercept write and end methods
		const originalWrite = res.write;
		const originalEnd = res.end;

		let body = "";

		res.write = function (chunk) {
			body += chunk.toString();
		};

		res.end = function (chunk) {
			if (chunk) {
				body += chunk.toString();
			}

			// Check if response is HTML
			if (res.getHeader("Content-Type") && res.getHeader("Content-Type").includes("text/html")) {
				// Inject the client-side script
				const script = `
          <script>
            (function() {
              var socket = new WebSocket('ws://' + location.hostname + ':${port}');
              socket.onmessage = function(event) {
                if (event.data === 'reload') {
                  location.reload();
                }
              };
            })();
          </script>
        `;
				body = body.replace(/<\/body>/i, script + "</body>");
			}

			// Remove the line that sets Content-Length
			// res.setHeader("Content-Length", Buffer.byteLength(body));
			res._livereloadInjected = true;
			res.write = originalWrite;
			res.end = originalEnd;
			res.end(body);
		};

		next();
	};
};

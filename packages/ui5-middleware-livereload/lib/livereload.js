/* eslint-disable no-unused-vars, no-undef */
const connectLivereload = require("connect-livereload");
const livereload = require("livereload");
const path = require("path");
const fs = require("fs");
const os = require("os");
const portfinder = require("portfinder");

/**
 * Determines the major version of the `@ui5/server` actually running the UI5 CLI.
 *
 * The middleware runs under `@ui5/server` and its major tracks the UI5 CLI/Tooling major
 * (CLI 3 → server 3, … CLI 5 → server 5). `middlewareUtil`/`getProject()` expose no tooling
 * version, so we read the exported `@ui5/server/package.json` version. This middleware does
 * not declare `@ui5/server` as a dependency, so we resolve it against both the project
 * (`cwd`) and the CLI bin directory (`process.argv[1]`), which reaches the running server.
 *
 * @param {string} cwd project root path
 * @returns {number|undefined} the `@ui5/server` major version, or `undefined` if unknown
 */
const getUI5ServerMajor = (cwd) => {
	try {
		const anchors = [cwd, path.dirname(process.argv[1] || "")].filter(Boolean);
		// "./package.json" is an exported subpath of @ui5/server (safe under exports enforcement)
		const pkgPath = require.resolve("@ui5/server/package.json", { paths: anchors });
		const version = require(pkgPath).version; // e.g. "5.0.0-alpha.6"
		const major = parseInt(String(version).split(".")[0], 10);
		return Number.isFinite(major) ? major : undefined;
	} catch (err) {
		return undefined; // unknown => caller must fail open (do NOT disable)
	}
};

/**
 * Decides whether the middleware should disable itself (become a no-op pass-through).
 *
 * `force` wins if set; otherwise the middleware auto-disables only when it positively
 * detects UI5 Tooling V5+ (which provides a built-in live reload). Unknown version fails
 * open (does not disable).
 *
 * @param {number|undefined} serverMajor the detected `@ui5/server` major version
 * @param {boolean|undefined} force explicit `configuration.force` (true=on, false=off)
 * @returns {boolean} whether to disable
 */
const shouldDisable = (serverMajor, force) => {
	if (force === true) return false; // forced on
	if (force === false) return true; // forced off (any version)
	return typeof serverMajor === "number" && serverMajor >= 5; // auto-disable on V5+, else fail open
};

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
 * <b>ATTENTION: this is a hack to be compatible with UI5 CLI 2.x and 3.x</b>
 *
 * @param {module:@ui5/fs.AbstractReader} collection Reader or Collection to read resources of the root project and its dependencies
 * @param {boolean} skipFwkDeps Whether to skip framework dependencies
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

	// UI5 Tooling V5+ provides a built-in live reload; auto-disable this middleware there
	// (unless forced) to avoid double reloads. `configuration.force` overrides in both
	// directions. This must run before any side effects (port, livereload server, watcher).
	const force = typeof options?.configuration?.force === "boolean" ? options.configuration.force : undefined;
	const serverMajor = getUI5ServerMajor(cwd);
	if (shouldDisable(serverMajor, force)) {
		if (force === false) {
			log.info("ui5-middleware-livereload: disabled via 'configuration.force: false'.");
		} else {
			log.info(
				`ui5-middleware-livereload: detected UI5 Tooling v${serverMajor} which provides built-in live reload — disabling this middleware. Set 'configuration.force: true' to keep it enabled (and disable the built-in one via --no-live-reload or server.settings.liveReload).`,
			);
		}
		return async function noopLivereload(req, res, next) {
			next();
		};
	}
	if (force === true && typeof serverMajor === "number" && serverMajor >= 5) {
		log.info(
			`ui5-middleware-livereload: UI5 Tooling v${serverMajor} detected but kept active via 'force' — this may conflict with the built-in live reload; disable it via --no-live-reload or server.settings.liveReload.`,
		);
	}

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
	let extraExts = options?.configuration?.extraExts || "jsx,ts,tsx,xml,json,properties";
	let debug = options?.configuration?.debug;
	let usePolling = options?.configuration?.usePolling;
	let host = options?.configuration?.host || "localhost";

	let serverOptions = {
		debug: debug,
		extraExts: extraExts ? extraExts.split(",") : undefined,
		port: port,
		host: host,
		exclusions: exclusions,
		usePolling: usePolling,
	};

	if (process.argv.includes("--h2")) {
		const indexKey = process.argv.indexOf("--key");
		sslKeyPath = indexKey !== -1 ? process.argv[indexKey + 1] : path.join(os.homedir(), ".ui5", "server", "server.key");
		const indexCert = process.argv.indexOf("--cert");
		sslCertPath = indexCert !== -1 ? process.argv[indexCert + 1] : path.join(os.homedir(), ".ui5", "server", "server.crt");
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
			watchPaths.push(path.resolve(cwd, watchPath[i]));
		}
		debug ? log.info(`Livereload connecting to port ${port} for paths ${watchPaths}`) : null;
		livereloadServer.watch(watchPaths);
	} else {
		debug ? log.info(`Livereload connecting to port ${port} for path ${watchPath}`) : null;
		livereloadServer.watch(path.resolve(cwd, watchPath));
	}

	// connect-livereload already holds the
	// method sig (req, res, next)
	return connectLivereload({
		port: port,
	});
};

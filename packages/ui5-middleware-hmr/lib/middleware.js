/* eslint-disable jsdoc/no-undefined-types */
const path = require("path");
const fs = require("fs");
const chokidar = require("chokidar");
const { WebSocketServer } = require("ws");
const portfinder = require("portfinder");
const { DepGraph } = require("./depgraph");
const { ViewGraph } = require("./viewgraph");

// Server-root-absolute path under which the client runtime is served. Kept absolute because
// the self-serve handler matches it against req.url, which the browser sends as an absolute
// path (a relative <script src> is resolved to an absolute URL before the request is made).
// The INJECTED <script> src is derived from this per request as a path relative to the HTML
// (see relativeClientSrc) so it resolves correctly when the app runs nested / behind a proxy.
const CLIENT_PATH = "/ui5-middleware-hmr/client.js";

/**
 * Determines the major version of the `@ui5/server` actually running the UI5 CLI.
 *
 * The middleware runs under `@ui5/server` and its major tracks the UI5 CLI/Tooling major
 * (CLI 3 → server 3, … CLI 5 → server 5). `middlewareUtil`/`getProject()` expose no tooling
 * version, so we read the exported `@ui5/server/package.json` version. Neither middleware
 * declares `@ui5/server` as a dependency, so we resolve it against both the project (`cwd`)
 * and the CLI bin directory (`process.argv[1]`), which reaches the running server.
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
	} catch {
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
 * Determines the source paths of the given resource collection recursively.
 *
 * <b>ATTENTION: this mirrors the hack used by ui5-middleware-livereload to be
 * compatible with UI5 CLI 2.x and 3.x</b>
 *
 * @param {module:@ui5/fs.AbstractReader} collection Reader or Collection
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
 * Classifies a changed file into an HMR change descriptor the client can dispatch on.
 *
 * The `module` field is the UI5 module name (namespace + path, no extension) so the
 * client can hand it to `sap.ui.loader._.unloadResources`. TypeScript sources map to
 * the same module name as their transpiled `.js` output.
 *
 * @param {string} relFromWebapp POSIX-style path of the file relative to the webapp root
 * @param {string} namespace the app namespace as a slash path, e.g. `my/app`
 * @returns {{kind: string, module?: string, path: string}} change descriptor
 */
const classify = (relFromWebapp, namespace) => {
	const ext = path.posix.extname(relFromWebapp).toLowerCase();
	const noExt = relFromWebapp.slice(0, relFromWebapp.length - ext.length);
	const toModule = () => (namespace ? `${namespace}/${noExt}` : noExt);
	// the UI5 "name" of a view/fragment is the path without the `.view`/`.fragment` segment
	// or extension, in dot notation: view/Main.view.xml -> <namespace>.view.Main
	const toViewName = () => {
		const base = noExt.replace(/\.(view|fragment)$/, "");
		return (namespace ? `${namespace}/${base}` : base).replace(/\//g, ".");
	};
	switch (ext) {
		case ".css":
			return { kind: "css", path: relFromWebapp };
		case ".properties":
			return { kind: "i18n", module: toModule(), path: relFromWebapp };
		case ".json":
			return { kind: "json", module: toModule(), path: relFromWebapp };
		case ".js":
		case ".ts":
			// controllers/components need special handling; the client decides based on the name
			return { kind: "module", module: toModule(), path: relFromWebapp };
		case ".xml":
			// XMLView.create re-reads the template (and any declaratively embedded fragment)
			// fresh, so a .view.xml change hot-swaps by re-instantiating the matching view.
			// A .fragment.xml change is resolved to its embedding view(s) by the change
			// handler (via the ViewGraph); the client re-instantiates those. Fragments loaded
			// imperatively (Fragment.load in a controller) have no embedding view and reload.
			if (/\.view$/.test(noExt)) {
				return { kind: "view", views: [toViewName()], path: relFromWebapp };
			}
			if (/\.fragment$/.test(noExt)) {
				return { kind: "fragment", fragmentName: toViewName(), path: relFromWebapp };
			}
			return { kind: "reload", path: relFromWebapp };
		default:
			// anything unknown: let the client fall back to reload
			return { kind: "reload", path: relFromWebapp };
	}
};

/**
 * Experimental HMR middleware.
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.resources Resource collections
 * @param {object} parameters.options Options
 * @param {object} parameters.options.configuration Custom server middleware configuration if given in ui5.yaml
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a MiddlewareUtil instance
 * @returns {Function} Middleware function to use
 */
module.exports = async ({ log, resources, options, middlewareUtil }) => {
	const config = options?.configuration || {};
	const debug = !!config.debug;
	const project = middlewareUtil.getProject();
	const cwd = project.getRootPath() || process.cwd();

	// UI5 Tooling V5+ provides a built-in live reload; auto-disable this middleware there
	// (unless forced) to avoid double reloads. `configuration.force` overrides in both
	// directions. This must run before any side effects (graph builds, port, WS, watcher).
	const force = typeof config.force === "boolean" ? config.force : undefined;
	const serverMajor = getUI5ServerMajor(cwd);
	if (shouldDisable(serverMajor, force)) {
		if (force === false) {
			log.info("ui5-middleware-hmr: disabled via 'configuration.force: false'.");
		} else {
			log.info(
				`ui5-middleware-hmr: detected UI5 Tooling v${serverMajor} which provides built-in live reload — disabling this middleware. Set 'configuration.force: true' to keep HMR enabled (and disable the built-in one via --no-live-reload or server.settings.liveReload).`,
			);
		}
		return async function noopHmr(req, res, next) {
			next();
		};
	}
	if (force === true && typeof serverMajor === "number" && serverMajor >= 5) {
		log.info(
			`ui5-middleware-hmr: UI5 Tooling v${serverMajor} detected but HMR kept active via 'force' — this may conflict with the built-in live reload; disable it via --no-live-reload or server.settings.liveReload.`,
		);
	}

	// namespace as a slash path, e.g. "my/app"; getNamespace() already returns slash notation
	const namespace = project.getNamespace?.() || "";

	// resolve the webapp root so we can express changes as module names
	const webappPath = path.resolve(cwd, project.getSourcePath?.() || "webapp");

	// build the static dependency graph of the app's own modules, so a leaf-module
	// change can also unload the modules that captured a reference to it
	const depGraph = new DepGraph(webappPath, namespace);
	try {
		depGraph.build();
		debug && log.info(`ui5-middleware-hmr: dependency graph built for namespace "${namespace}"`);
	} catch (err) {
		log.warn(`ui5-middleware-hmr: failed to build dependency graph (dependents won't be tracked): ${err}`);
	}

	// build the fragment→embedding-views graph so a changed *.fragment.xml can be hot-swapped
	// by re-instantiating the view(s) that declaratively embed it
	const viewGraph = new ViewGraph(webappPath, namespace);
	try {
		viewGraph.build();
		debug && log.info(`ui5-middleware-hmr: view/fragment graph built for namespace "${namespace}"`);
	} catch (err) {
		log.warn(`ui5-middleware-hmr: failed to build view graph (fragment changes will reload): ${err}`);
	}

	// watch paths: explicit config wins, otherwise derive from project resources. Framework
	// dependencies are never watched — their files don't change during app development and
	// can't be hot-swapped anyway; app (non-framework) dependencies are included.
	let watchPaths = config.watchPath || config.path;
	if (!watchPaths) {
		watchPaths = determineSourcePaths(resources.all, true /* skip framework deps */);
	}
	watchPaths = (Array.isArray(watchPaths) ? watchPaths : [watchPaths]).map((p) => path.resolve(cwd, p));

	const port = config.port || (await portfinder.getPortPromise({ port: 35739 }));

	// standalone ws server (kept separate from the UI5 http server for prototype simplicity)
	const wss = new WebSocketServer({ port });
	log.info(`ui5-middleware-hmr: websocket server listening on port ${port}`);

	const broadcast = (msg) => {
		const data = JSON.stringify(msg);
		debug && log.info(`ui5-middleware-hmr: -> ${data}`);
		wss.clients.forEach((client) => {
			if (client.readyState === 1 /* OPEN */) {
				client.send(data);
			}
		});
	};

	// exclusions: one or many `regex` (as strings), aligned with ui5-middleware-livereload.
	// VCS metadata dirs and node_modules are always excluded; user exclusions add to them.
	let exclusions = config.exclusions;
	if (Array.isArray(exclusions)) {
		exclusions = exclusions.map((exclusion) => new RegExp(exclusion));
	} else if (exclusions) {
		exclusions = [new RegExp(exclusions)];
	} else {
		exclusions = [];
	}
	const ignored = [/(^|[/\\])(\.git|\.svn|\.hg|node_modules)([/\\]|$)/].concat(exclusions);

	const watcher = chokidar.watch(watchPaths, {
		ignoreInitial: true,
		ignored: ignored,
		usePolling: !!config.usePolling,
		// Wait for writes to settle before firing. Without this, the change event can fire
		// mid-write and the client re-fetches the OLD bytes (then caches them), so the
		// hot-swap silently loads stale code. Values are conservative for editor + tooling
		// (e.g. transpile) round-trips.
		awaitWriteFinish: {
			stabilityThreshold: 300,
			pollInterval: 50,
		},
	});
	watcher.on("change", (file) => {
		const abs = path.resolve(file);
		let rel;
		if (abs.startsWith(webappPath + path.sep)) {
			rel = path.relative(webappPath, abs);
		} else {
			// changed file outside the app webapp (e.g. a dependency) — can't map to a module name safely
			debug && log.info(`ui5-middleware-hmr: change outside webapp, forcing reload: ${abs}`);
			broadcast({ kind: "reload" });
			return;
		}
		const relPosix = rel.split(path.sep).join(path.posix.sep);
		const change = classify(relPosix, namespace);

		// for module changes, refresh the changed module's edges and attach the
		// transitive set of app modules that depend on it, so the client can unload
		// them too (they captured the old reference in their closures)
		if (change.kind === "module" && change.module) {
			try {
				depGraph.updateModule(change.module, fs.readFileSync(abs, "utf-8"));
			} catch {
				/* ignore unreadable file; keep previous edges */
			}
			const dependents = depGraph.transitiveDependents(change.module);
			if (dependents.length) {
				change.dependents = dependents;
			}
		}

		// keep the view/fragment graph current, and resolve a fragment change to the view(s)
		// that embed it (only views have a live instance we can re-instantiate)
		if (change.kind === "view" || change.kind === "fragment") {
			const node = viewGraph.relToNode(relPosix);
			if (node) {
				try {
					viewGraph.updateNode(node.name, node.isView, fs.readFileSync(abs, "utf-8"));
				} catch {
					/* ignore unreadable file; keep previous edges */
				}
			}
		}
		if (change.kind === "fragment") {
			const views = viewGraph.viewsEmbedding(change.fragmentName);
			if (views.length) {
				// re-instantiate the embedding view(s); XMLView.create re-reads the fragment fresh
				broadcast({ kind: "view", views: views, path: change.path });
			} else {
				// no declarative embedder found → likely an imperatively-loaded fragment (dialog);
				// no view to swap, so fall back to a full reload
				debug && log.info(`ui5-middleware-hmr: fragment ${change.fragmentName} has no embedding view, reloading`);
				broadcast({ kind: "reload", path: change.path });
			}
			return;
		}
		broadcast(change);
	});
	watcher.on("error", (err) => log.error(`ui5-middleware-hmr: watcher error: ${err}`));

	// the client runtime, parameterized with the ws port
	const clientSource = fs.readFileSync(path.join(__dirname, "client.js"), "utf-8").replace("__HMR_PORT__", String(port));

	// The injected <script> src must be RELATIVE to the served HTML's own URL, not the
	// server-root-absolute CLIENT_PATH. When the app runs nested — embedded via a
	// ComponentContainer behind another app's router, or served under a path-prefixing proxy —
	// an absolute "/ui5-middleware-hmr/client.js" resolves against the OUTER document's origin
	// root and 404s (it never reaches this middleware). A path relative to the HTML walks back
	// to THIS server's root through whatever prefix was used to reach the HTML, so it resolves
	// correctly at any nesting depth:
	//   /index.html         -> ui5-middleware-hmr/client.js
	//   /foo/index.html     -> ../ui5-middleware-hmr/client.js
	//   /foo/bar/index.html -> ../../ui5-middleware-hmr/client.js
	const clientRelPath = CLIENT_PATH.replace(/^\//, ""); // strip leading slash for relative use
	const relativeClientSrc = (reqUrl) => {
		// depth = directory levels the HTML sits below the server root. The request path is
		// root-relative (always starts with "/"), so that's (number of "/" in the path) - 1,
		// counting the HTML's containing directory only (a trailing-slash dir URL counts the same
		// as its index.html). Query/hash are irrelevant to the directory depth.
		const pathname = String(reqUrl || "/").split(/[?#]/)[0];
		const slashes = pathname.split("/").length - 1;
		const depth = Math.max(0, slashes - 1);
		return `${"../".repeat(depth)}${clientRelPath}`;
	};

	// connect-style middleware: serve the client script and inject the tag into served HTML
	return function hmrMiddleware(req, res, next) {
		if (req.url === CLIENT_PATH) {
			res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" });
			res.end(clientSource);
			return;
		}

		// Prevent the browser from caching watched hot-swappable resources. Without this,
		// UI5's ResourceBundle._recreate() (and JSONModel reloads) can re-fetch the OLD
		// content from the browser HTTP cache even after we evict UI5's own caches. i18n
		// especially: the bundle URL is fixed, so a cached 200/304 defeats the hot refresh.
		// We also cover app-level .js so a hot-swapped module/controller re-fetches fresh
		// code — but NOT framework resources under /resources/ (stable, safe to cache) nor
		// the injected client itself.
		const url = req.url || "";
		const isFramework = url.indexOf("/resources/") === 0;
		const noStore = !isFramework && url !== CLIENT_PATH && /\.(properties|json|xml|js)(\?|$)/.test(url);
		if (noStore) {
			res.setHeader("Cache-Control", "no-store, must-revalidate");
			res.setHeader("Pragma", "no-cache");
			res.setHeader("Expires", "0");
		}

		// buffer HTML responses so we can inject the client <script> before </body>
		const accept = req.headers.accept || "";
		if (req.method !== "GET" || accept.indexOf("text/html") === -1) {
			return next();
		}

		const chunks = [];
		const origWrite = res.write.bind(res);
		const origEnd = res.end.bind(res);
		let hijack = null; // null = undecided, true/false once headers are known

		const shouldHijack = () => {
			if (hijack === null) {
				const ct = res.getHeader("content-type");
				hijack = !!ct && String(ct).toLowerCase().indexOf("text/html") >= 0;
			}
			return hijack;
		};

		res.write = function (chunk, encoding, cb) {
			if (shouldHijack()) {
				if (chunk) {
					chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
				}
				if (typeof cb === "function") cb();
				return true;
			}
			return origWrite(chunk, encoding, cb);
		};

		res.end = function (chunk, encoding, cb) {
			if (shouldHijack()) {
				if (chunk) {
					chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
				}
				let html = Buffer.concat(chunks).toString("utf-8");
				// build the <script> tag with an src relative to THIS HTML's URL (see relativeClientSrc)
				const injectTag = `<script src="${relativeClientSrc(req.url)}"></script>`;
				// idempotency guard: match on the stable path suffix, not the full (depth-varying) src
				if (html.indexOf(clientRelPath) === -1) {
					if (/<\/body>/i.test(html)) {
						html = html.replace(/<\/body>/i, `${injectTag}</body>`);
					} else {
						html += injectTag;
					}
				}
				res.setHeader("Content-Length", Buffer.byteLength(html));
				origWrite(html);
				return origEnd(undefined, undefined, cb);
			}
			return origEnd(chunk, encoding, cb);
		};

		next();
	};
};

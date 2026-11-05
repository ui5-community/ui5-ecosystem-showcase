// based on "packages/cds-plugin-ui5/lib/applyUI5Middleware.js"

const path = require("path");
const fs = require("fs");

// === PoC (UI5 CLI v5 build cache) ===========================================
// Track BuildServers created by the opt-in cache path and release their file
// watchers + SQLite cache handles once, on a graceful stop. A single shared
// SIGTERM listener (registered lazily) avoids per-module MaxListeners warnings.
// SIGTERM only — NOT SIGINT — so the host dev-server's Ctrl+C handling is left
// untouched. Productisation should call destroy() from the host server's own
// close hook instead of relying on a process signal.
const __ui5BuildServers = new Set();
let __ui5CleanupRegistered = false;
function __registerBuildServerCleanup(buildServer) {
	__ui5BuildServers.add(buildServer);
	if (!__ui5CleanupRegistered) {
		__ui5CleanupRegistered = true;
		process.once("SIGTERM", () => {
			for (const bs of __ui5BuildServers) {
				bs.destroy().catch(() => {});
			}
		});
	}
}

/**
 * @typedef applyUI5MiddlewareOptions
 * @type {object}
 * @property {string} [cwd] cwd to resolve relative config files to, e.g. "./ui5.yaml" or "./ui5-workspace.yaml" (defaults to `process.cwd()`)
 * @property {string} [basePath] base path of the UI5 application (defaults to `process.cwd()`)
 * @property {string} [configFile] name of the config file (defaults to "ui5.yaml")
 * @property {string} [configPath] /!\ RESTRICTED /!\ - path to the ui5.yaml (defaults to "${basePath}/${configFile}")
 * @property {string} [workspaceName] name of the workspace (defaults to "default" when the file at workspaceConfigPath exists)
 * @property {string} [workspaceConfigFile] name of the workspace config file (defaults to "ui5-workspace.yaml")
 * @property {string} [workspaceConfigPath] /!\ RESTRICTED /!\ - path to the ui5-workspace.yaml (defaults to "${basePath}/${workspaceConfigFile}")
 * @property {string} [versionOverride] Framework version to use instead of the one defined in the root project
 * @property {string} [cacheMode] /!\ RESTRICTED /!\ - Cache mode to use when consuming SNAPSHOT versions of a framework (one of: Default|False|Off)
 */

// inspired by https://github.com/SAP/karma-ui5/blob/main/lib/framework.js#L466-L522
/**
 * Applies the middlewares for the UI5 application located in the given
 * root directory to the given router.
 * @param {import("express").Router} router Express Router instance
 * @param {applyUI5MiddlewareOptions} options configuration options
 */
module.exports = async function applyUI5Middleware(router, options) {
	const { graphFromPackageDependencies } = await import("@ui5/project/graph");
	const { createReaderCollection } = await import("@ui5/fs/resourceFactory");

	options.cwd = options.cwd || process.cwd();
	options.basePath = options.basePath || process.cwd();

	const configPath = options.configPath || options.basePath;
	const configFile = options.configFile || "ui5.yaml";
	const workspaceConfigPath = options.workspaceConfigPath || options.basePath;
	const workspaceConfigFile = options.workspaceConfigFile || "ui5-workspace.yaml";

	const determineConfigPath = function (configPath, configFile) {
		// ensure that the config path is absolute
		if (!path.isAbsolute(configPath)) {
			configPath = path.resolve(options.basePath, configPath);
		}
		// if the config path is a file, then we assume that this is the
		// configuration which should be used for the UI5 server middlewares
		if (fs.existsSync(configPath) && fs.statSync(configPath).isFile()) {
			return configPath;
		}
		// if the configuration file is starting with ./ or ../ then we
		// resolve the configuration relative to the current working dir
		// otherwise we are resolving it relative to the config path
		// which is typically the directory of the UI5 application
		configPath = path.resolve(/^\.\.?\//.test(configFile) ? options.cwd : configPath, configFile);
		if (fs.existsSync(configPath) && fs.statSync(configPath).isFile()) {
			return configPath;
		}
		// nothing matched => no config
		return undefined;
	};

	const graph = await graphFromPackageDependencies({
		cwd: options.basePath,
		rootConfigPath: determineConfigPath(configPath, configFile),
		workspaceName: process.env["ui5-workspace"] || options.workspaceName || "default",
		workspaceConfigPath: determineConfigPath(workspaceConfigPath, workspaceConfigFile),
		versionOverride: options.versionOverride,
		cacheMode: options.cacheMode,
	});

	const rootProject = graph.getRoot();

	// === PoC (UI5 CLI v5 build cache) ========================================
	// Opt-in: serve the mounted module through the v5 build-then-serve cache
	// (graph.serve -> BuildServer) instead of the live source readers, so the
	// build result is cached and reused across restarts.
	// Two gates must BOTH hold, which guarantees ZERO change for @ui5/server v3/v4:
	//   1. options.buildCache === true        (explicit opt-in via the module config)
	//   2. typeof graph.serve === "function"  (this API only exists on @ui5/* v5)
	// Requires an application/component-type configFile that defines the build
	// TASKS (e.g. ui5-build.yaml). A `type: module` config is NOT supported here.
	const useBuildCache = options.buildCache === true && typeof graph.serve === "function";

	let resources;
	if (useBuildCache) {
		try {
			const { default: Cache } = await import("@ui5/project/build/cache/Cache");
			const buildServer = await graph.serve({
				// Build the root (the mounted module) eagerly at startup so that a
				// restart hits the cache; mirrors @ui5/server's own serve().
				initialBuildRootProject: true,
				excludedTasks: ["minify", "generateLibraryPreload", "generateComponentPreload", "generateBundle"],
				cache: Cache.Default,
			});
			// Track for cleanup immediately (before touching readers), so the watcher
			// + SQLite handle are released even if a later step throws.
			__registerBuildServerCleanup(buildServer);
			buildServer.on("error", (err) => {
				console.error(`[ui5-middleware-ui5] BuildServer error: ${err?.message ?? err}`);
				if (err?.stack) {
					console.error(err.stack);
				}
			});
			resources = {
				rootProject: buildServer.getRootReader(),
				dependencies: buildServer.getDependenciesReader(),
				all: buildServer.getReader(),
			};
		} catch (err) {
			// Degrade to the live source path rather than crash host startup if the
			// build cache is unavailable (e.g. watcher-init / build-setup failure).
			console.error(`[ui5-middleware-ui5] build cache unavailable, falling back to live source readers: ${err?.message ?? err}`);
			resources = undefined;
		}
	}

	if (!resources) {
		// --- legacy path (v3/v4, v5 without opt-in, or cache fallback): UNCHANGED -
		const readers = [];
		await graph.traverseBreadthFirst(async function ({ project: dep }) {
			if (dep.getName() === rootProject.getName()) {
				// Ignore root project
				return;
			}
			readers.push(dep.getReader({ style: "runtime" }));
		});

		const dependencies = createReaderCollection({
			name: `Dependency reader collection for project ${rootProject.getName()}`,
			readers,
		});

		const rootReader = rootProject.getReader({ style: "runtime" });

		// TODO change to ReaderCollection once duplicates are sorted out
		const combo = createReaderCollection({
			name: "server - prioritize workspace over dependencies",
			readers: [rootReader, dependencies],
		});
		resources = {
			rootProject: rootReader,
			dependencies: dependencies,
			all: combo,
		};
	}

	// TODO: rework ui5-server API and make public
	const { default: MiddlewareManager } = await import("@ui5/server/internal/MiddlewareManager");
	const middlewareManager = new MiddlewareManager({
		graph,
		rootProject,
		resources,
		options: {
			//sendSAPTargetCSP,
			//serveCSPReports,
			//simpleIndex: true
			liveReload: { active: false, token: null },
		},
	});
	await middlewareManager.applyMiddleware(router);
};

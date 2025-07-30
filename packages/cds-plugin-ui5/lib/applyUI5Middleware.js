const path = require("path");
const fs = require("fs");
const { glob } = require("glob");
const yaml = require("js-yaml");

const PAGE_GLOB_PATTERN = "**/!(*.fragment).{html,htm}";

/**
 * @typedef UI5AppInfo
 * @type {object}
 * @property {Array<string>} pages root path of the module
 */

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
 * @property {string} [log] the logger (defaults to console)
 */

// inspired by https://github.com/SAP/karma-ui5/blob/main/lib/framework.js#L466-L522
/**
 * Applies the middlewares for the UI5 application located in the given
 * root directory to the given router.
 * @param {import("express").Router} router Express Router instance
 * @param {applyUI5MiddlewareOptions} options configuration options
 * @returns {Promise<UI5AppInfo>} UI5 application information object
 */
module.exports = async function applyUI5Middleware(router, options) {
	const millis = Date.now();

	options.cwd = options.cwd || process.cwd();
	options.basePath = options.basePath || process.cwd();
	options.lazy = options.lazy || false;

	const log = options.log || console;

	const configPath = options.configPath || options.basePath;
	const configFile = options.configFile || "ui5.yaml";
	const workspaceConfigPath = options.workspaceConfigPath || options.basePath;
	const workspaceConfigFile = options.workspaceConfigFile || "ui5-workspace.yaml";

	const logPerformance = options.logPerformance || false;

	const determineConfigPath = (configPath, configFile) => {
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

	const loadAppInfo = async () => {
		const millisImport = logPerformance && Date.now();
		const { graphFromPackageDependencies } = await import("@ui5/project/graph");
		logPerformance && log.info(`[PERF] Import took ${Date.now() - millisImport}ms`);

		// determine the project graph from the given options
		const millisGraph = logPerformance && Date.now();
		const graph = await graphFromPackageDependencies({
			cwd: options.basePath,
			rootConfigPath: determineConfigPath(configPath, configFile),
			workspaceName: process.env["ui5-workspace"] || options.workspaceName || "default",
			workspaceConfigPath: determineConfigPath(workspaceConfigPath, workspaceConfigFile),
			versionOverride: options.versionOverride,
			cacheMode: options.cacheMode,
		});
		logPerformance && log.info(`[PERF] Graph took ${Date.now() - millisGraph}ms`);

		const millisRoot = logPerformance && Date.now();
		// detect the root project
		const rootProject = graph.getRoot();

		// create a reader for the root project
		const rootReader = rootProject.getReader({ style: "runtime" });
		logPerformance && log.info(`[PERF] Root project took ${Date.now() - millisRoot}ms`);

		return { rootProject, rootReader, graph };
	};

	const loadPages = async ({ rootProject, rootReader }) => {
		// for Fiori elements based applications we need to invalidate the view cache
		// so we need to append the query parameter to the HTML files (sap-ui-xx-viewCache=false)
		const isFioriElementsBased = rootProject.getFrameworkDependencies().find((lib) => lib.name.startsWith("sap.fe"));

		// collect app pages from workspace (glob testing: https://globster.xyz/ and https://codepen.io/mrmlnc/pen/OXQjMe)
		//   -> but exclude the HTML fragments from the list of app pages!
		const millisPages = logPerformance && Date.now();
		const pages = (await rootReader.byGlob(PAGE_GLOB_PATTERN)).map((resource) => `${resource.getPath()}${isFioriElementsBased ? "?sap-ui-xx-viewCache=false" : ""}`);
		logPerformance && log.info(`[PERF] Pages took ${Date.now() - millisPages}ms`);
		return pages;
	};

	// method to create the middleware manager and to apply the middlewares
	// to the express router provided as a parameter to this function
	const apply = async ({ rootProject, rootReader, graph, pages }) => {
		// find the relevant readers for the dependencies
		const readers = [];
		await graph.traverseBreadthFirst(async function ({ project: dep }) {
			if (dep.getName() === rootProject.getName()) {
				// Ignore root project
				return;
			}
			readers.push(dep.getReader({ style: "runtime" }));
		});

		const { createReaderCollection } = await import("@ui5/fs/resourceFactory");

		// create a reader collection for the dependencies
		const dependencies = createReaderCollection({
			name: `Dependency reader collection for project ${rootProject.getName()}`,
			readers,
		});

		// TODO change to ReaderCollection once duplicates are sorted out
		const combo = createReaderCollection({
			name: "server - prioritize workspace over dependencies",
			readers: [rootReader, dependencies],
		});
		const resources = {
			rootProject: rootReader,
			dependencies: dependencies,
			all: combo,
		};

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
			},
		});
		await middlewareManager.applyMiddleware(router);

		// custom pages are not collectible in lazy loading mode
		if (!pages) {
			return;
		}
		// collect app pages from middlewares implementing the getAppPages
		// which will only work if the middleware is executed synchronously
		middlewareManager.middlewareExecutionOrder?.map((name) => {
			const { middleware } = middlewareManager.middleware?.[name] || {};
			if (typeof middleware?.getAppPages === "function") {
				if (!options.lazy) {
					const customAppPages = middleware.getAppPages();
					if (Array.isArray(customAppPages)) {
						pages.push(...customAppPages);
					} else {
						if (customAppPages) {
							log.warn(`The middleware ${name} returns an unexpected value for "getAppPages". The value must be either undefined or string[]! Ignoring app pages from middleware!`);
						}
					}
				} else {
					log.warn(`The middleware ${name} returns a function for "getAppPages" but the lazy option is enabled. The function will not be executed!`);
				}
			}
		});
	};

	const determineWebappPath = (ui5ConfigPath) => {
		if (!ui5ConfigPath) {
			log.warn("Path to config file could not be determined. Using default webapp path to lookup HTML pages");
			return "webapp";
		}

		/** @type {{resources: {configuration: {paths: {webapp: string}}}}[]} */
		let ui5Configs;
		try {
			// read the ui5.yaml file to extract the configuration
			const content = fs.readFileSync(ui5ConfigPath, "utf-8");
			ui5Configs = yaml.loadAll(content);
		} catch (err) {
			if (err.name === "YAMLException") {
				log.error(`Failed to read ${ui5ConfigPath}!`);
			}
			throw err;
		}

		const webappPath = ui5Configs?.[0]?.resources?.configuration?.paths?.webapp;
		if (webappPath) {
			log.debug(`Determined custom "webapp" path "${webappPath}"`);
		}
		return webappPath ?? "webapp";
	};

	// install a callback in the router to apply the middlewares
	if (options.lazy) {
		let isApplied = false;
		router.use(async (req, res, next) => {
			if (!isApplied) {
				const { graph, rootProject, rootReader } = await loadAppInfo();
				await apply({ graph, rootProject, rootReader });
				isApplied = true;
			}
			next();
		});
		const webappPath = determineWebappPath(determineConfigPath(configPath, configFile));
		// collect pages via glob pattern
		return {
			pages: (await glob(PAGE_GLOB_PATTERN, { cwd: path.join(configPath, webappPath) })).map((p) => (!p.startsWith("/") ? `/${p}` : p)),
		};
	} else {
		const { graph, rootProject, rootReader } = await loadAppInfo();
		const pages = await loadPages({ rootProject, rootReader });
		await apply({ graph, rootProject, rootReader, pages });
		logPerformance && log.info(`[PERF] applyUI5Middleware took ${Date.now() - millis}ms`);

		// return the UI5 application information
		return { pages };
	}
};

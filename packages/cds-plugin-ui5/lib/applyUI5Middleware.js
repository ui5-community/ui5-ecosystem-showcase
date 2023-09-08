const path = require("path");
const fs = require("fs");

const log = require("./log");

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
 */

// inspired by https://github.com/SAP/karma-ui5/blob/main/lib/framework.js#L466-L522
/**
 * Applies the middlewares for the UI5 application located in the given
 * root directory to the given router.
 * @param {import("express").Router} router Express Router instance
 * @param {applyUI5MiddlewareOptions} options configuration options
 * @returns {UI5AppInfo} UI5 application information object
 */
module.exports = async function applyUI5Middleware(router, options) {
	const { graphFromPackageDependencies } = await import("@ui5/project/graph");
	const { createReaderCollection } = await import("@ui5/fs/resourceFactory");

	options.cwd = options.cwd || process.cwd();
	options.basePath = options.basePath || process.cwd();

	const configPath = options.configPath || options.basePath;
	const configFile = options.configFile || "ui5.yaml";
	const workspaceConfigPath = options.workspaceConfigPath || options.basePath;
	const workpaceConfigFile = options.workpaceConfigFile || "ui5-workspace.yaml";

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
		workspaceConfigPath: determineConfigPath(workspaceConfigPath, workpaceConfigFile),
		versionOverride: options.versionOverride,
		cacheMode: options.cacheMode,
	});

	const rootProject = graph.getRoot();

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

	// collect app pages from workspace (glob testing: https://globster.xyz/ and https://codepen.io/mrmlnc/pen/OXQjMe)
	//   -> but exclude the HTML fragments from the list of app pages!
	const pages = (await rootReader.byGlob("**/!(*.fragment).{html,htm}")).map((resource) => resource.getPath());

	// collect app pages from middlewares implementing the getAppPages
	middlewareManager.middlewareExecutionOrder?.map((name) => {
		const { middleware } = middlewareManager.middleware?.[name] || {};
		if (typeof middleware?.getAppPages === "function") {
			const customAppPages = middleware.getAppPages();
			if (Array.isArray(customAppPages)) {
				pages.push(...customAppPages);
			} else {
				if (customAppPages) {
					log.warn(`The middleware ${name} returns an unexpected value for "getAppPages". The value must be either undefined or string[]! Ignoring app pages from middleware!`);
				}
			}
		}
	});

	return {
		pages,
	};
};

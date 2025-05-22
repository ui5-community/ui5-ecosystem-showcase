/* eslint-disable no-unused-vars */
const path = require("path");
const { existsSync, lstatSync } = require("fs");
const { readFile, writeFile, mkdir, rm, stat } = require("fs").promises;
const yaml = require("js-yaml");

const etag = require("etag");
const fresh = require("fresh");
const { Agent: HttpsAgent } = require("https");

/**
 * Loads the yaml file framework libraries configuration
 *
 * @param {object} resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @returns {Array<{ name: string }>} Array of libraries defined in the framework section
 */
async function getLibrariesDefinedInResources(resources) {
	const projetcReader = resources.rootProject._readers.find((reader) => {
		return !!reader._reader?._project?._config?.framework?.libraries;
	});

	if (projetcReader) {
		return projetcReader._reader._project._config.framework.libraries;
	}

	return [];
}

/**
 * Loads the yaml file from the given path and returns the libraries defined in the framework section.
 *
 * @param {string} pathToUI5Config Absolute path to the ui5-x.yaml file
 * @returns {Array<{ name: string }>} Array of libraries defined in the framework section
 */
async function getLibrariesDefinedInYaml(pathToUI5Config) {
	if (!existsSync(pathToUI5Config)) {
		return [];
	}

	const file = await readFile(pathToUI5Config, { encoding: "utf-8" });
	const ui5Config = yaml.load(file);

	return ui5Config?.framework?.libraries || [];
}

/**
 * Serves the built variant of the current framework
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.options Options
 * @param {object} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {boolean} [parameters.options.configuration.saveLibsLocal] Whether to save libraries in the project directory instead of user home
 * @param {string} [parameters.options.configuration.cachePath] Custom path to store cached framework files
 * @param {string} [parameters.options.configuration.configPath] Custom path to a local ui5.yaml file that shall be used to identify the framework libraries if saveLibsLocal is set to true
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @returns {Function} Middleware function to use
 */
module.exports = async ({ log, options, middlewareUtil, resources }) => {
	// provide a set of default runtime options
	const effectiveOptions = {
		debug: false,
		strictSSL: true,
		saveLibsLocal: false, // New parameter to save libraries locally
		cachePath: undefined,
	};
	// config-time options from ui5.yaml for cfdestination take precedence
	if (options.configuration) {
		Object.assign(effectiveOptions, options.configuration);
	}

	// derive framework from current project
	const rootProject = middlewareUtil.getProject();
	const frameworkName = rootProject.getFrameworkName();
	const envFilePath = options.configuration?.envFilePath || "./.env";
	require("dotenv").config({
		path: envFilePath,
	});
	const ui5VersionEnvVariable = options.configuration?.ui5VersionEnvVariable;
	const frameworkVersion = process.env[ui5VersionEnvVariable] || rootProject.getFrameworkVersion();
	log.info(`Loading sources for ${frameworkName} version ${frameworkVersion}`);

	// check if the framework libraries are loaded from the local cache in the user home
	// by checking the library version to be the last segment of the folder name of the library path
	const isWorkspace =
		middlewareUtil
			.getProject()
			.getFrameworkDependencies()
			.filter(({ name }) => {
				const project = middlewareUtil.getProject(name);
				return !project.getRootPath().endsWith(`${path.sep}${project.getVersion()}`);
			}).length > 0;

	// only if a framework is specified and no workspace, the middleware gets active
	if (frameworkName && !isWorkspace) {
		// derive the npm scope and the version
		const frameworkScope = `@${frameworkName.toLowerCase()}`;

		// all the data is stored in the `.ui5` folder
		const homeDir = require("os").homedir();
		if (!effectiveOptions.cachePath) {
			if (effectiveOptions.saveLibsLocal) {
				effectiveOptions.cachePath = path.join(process.cwd(), ".ui5-middleware-serveframework");
			} else {
				effectiveOptions.cachePath = path.resolve(homeDir, `.ui5/ui5-middleware-serveframework`);
			}
		}

		const frameworkDir = path.join(effectiveOptions.cachePath, `${frameworkName.toLowerCase()}/${frameworkVersion}`);
		if (!existsSync(frameworkDir)) {
			await mkdir(frameworkDir, { recursive: true });
		}

		// get or download the version info file from local cache or CDN
		const versionInfoFile = path.resolve(frameworkDir, `sap-ui-version.json`);
		if (!existsSync(versionInfoFile)) {
			// determine the CDN base url for the framework
			const baseUrl = {
				openui5: "https://sdk.openui5.org",
				sapui5: "https://ui5.sap.com",
			}[frameworkName.toLowerCase()];

			// support for corporate proxies
			const { getProxyForUrl } = await import("proxy-from-env");
			const { HttpsProxyAgent } = await import("https-proxy-agent");
			// detect and configure proxy agent
			const proxyUrl = getProxyForUrl(baseUrl);
			const agentOptions = { rejectUnauthorized: effectiveOptions.strictSSL };

			const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl, agentOptions) : new HttpsAgent(agentOptions);

			if (effectiveOptions.debug) {
				log.info(`[${baseUrl}] Proxy: ${proxyUrl || "n/a"}, strictSSL: ${effectiveOptions.strictSSL}`);
			}

			// fetch the version information for the concrete version from CDN
			const fetch = (await import("node-fetch")).default;
			const versionUrl = `${baseUrl}/${frameworkVersion}/resources/sap-ui-version.json`;
			const response = await fetch(versionUrl, { agent });
			const versionInfo = await response.json();
			await writeFile(versionInfoFile, JSON.stringify(versionInfo), { encoding: "utf-8" });
		}
		const versionInfo = JSON.parse(await readFile(versionInfoFile, { encoding: "utf-8" }));

		// lookup an existing locally built framework version or build a missing framework locally
		const frameworkPkgJson = path.resolve(frameworkDir, `package.json`);
		const frameworkUI5Yaml = path.resolve(frameworkDir, `ui5.yaml`);
		const frameworkWebappDir = path.join(frameworkDir, "webapp");
		const frameworkManifest = path.resolve(frameworkWebappDir, `manifest.json`);
		const frameworkDestDir = path.join(frameworkDir, "dist");
		const frameworkReadyMarker = path.join(frameworkDir, ".ready");
		const existsFramework = [frameworkPkgJson, frameworkUI5Yaml, frameworkManifest, frameworkDestDir, frameworkReadyMarker].reduce((prev, cur) => {
			return prev && existsSync(cur);
		}, true);

		// check if the framework was build with the setting saveLibsLocal and if the depdencies changed which would require a rebuild
		let localLibsRequiredRebuild = false;

		const shouldUseLocalUI5Config = !!effectiveOptions.saveLibsLocal;

		if (shouldUseLocalUI5Config && effectiveOptions.debug) {
			log.info(`[DEBUG] Checking for local UI5 depdendencies ...`);
		}

		const localUI5Depdendencies = await getLibrariesDefinedInResources(resources);

		if (shouldUseLocalUI5Config && effectiveOptions.debug) {
			log.info(`[DEBUG] Found ${localUI5Depdendencies.length} local UI5 depdendencies ...`);
		}

		if (shouldUseLocalUI5Config && localUI5Depdendencies.length > 0) {
			const frameworkUI5Dependencies = await getLibrariesDefinedInYaml(frameworkUI5Yaml);

			// if the two yaml files do not have the same dependencies listed, a rebuild is required
			localLibsRequiredRebuild = localUI5Depdendencies.map((lib) => lib.name).join(",") !== frameworkUI5Dependencies.map((lib) => lib.name).join(",");
		}

		if (shouldUseLocalUI5Config && localUI5Depdendencies.length === 0) {
			log.warn(`\n\n\n[WARN] Could not find localUI5Dependencies. The framework will be build with all UI5 libraries! \n\n`);
		}

		if (effectiveOptions.debug) {
			if (localLibsRequiredRebuild) {
				log.info(`[DEBUG] UI5 libraries of config and ${frameworkUI5Yaml} do not match! Rebuilding framework libraries ...`);
			} else {
				log.info(`[DEBUG] UI5 libraries of config and ${frameworkUI5Yaml} match! No rebuild required ...`);
			}
		}

		if (!existsFramework || localLibsRequiredRebuild) {
			existsSync(frameworkWebappDir) && (await rm(frameworkWebappDir, { recursive: true }));
			existsSync(frameworkDestDir) && (await rm(frameworkDestDir, { recursive: true }));
			await mkdir(frameworkWebappDir, { recursive: true });

			// create a dummy manifest to simulate a very basic application
			await writeFile(
				frameworkPkgJson,
				JSON.stringify(
					{
						name: frameworkName.toLowerCase(),
						version: frameworkVersion,
					},
					undefined,
					2,
				),
				{
					encoding: "utf-8",
				},
			);

			let libraries = [];

			if (shouldUseLocalUI5Config && localUI5Depdendencies.length > 0) {
				libraries = localUI5Depdendencies.map((library) => {
					return { name: library.name };
				});
			} else {
				libraries = versionInfo.libraries
					.filter((library) => {
						const npmPackageName = library.npmPackageName;
						if (npmPackageName) {
							if (frameworkScope === "@openui5") {
								return npmPackageName.startsWith("@openui5/");
							} else {
								return true;
							}
						} else {
							return false;
						}
					})
					.map((library) => {
						return { name: library.name };
					});
			}

			// create ui5.yaml to list all libraries
			let ui5YamlContent = yaml.dump({
				specVersion: "3.0",
				metadata: {
					name: frameworkName.toLowerCase(),
				},
				type: "application",
				framework: {
					name: frameworkName,
					version: frameworkVersion,
					libraries: libraries,
				},
			});

			// create a dummy manifest to simulate a very basic application
			await writeFile(frameworkUI5Yaml, ui5YamlContent, {
				encoding: "utf-8",
			});

			// create a dummy manifest to simulate a very basic application
			await writeFile(
				frameworkManifest,
				JSON.stringify(
					{
						"sap.app": {
							id: frameworkName.toLowerCase(),
							type: "application",
							applicationVersion: {
								version: frameworkVersion,
							},
						},
					},
					undefined,
					2,
				),
				{
					encoding: "utf-8",
				},
			);

			// create a project graph with all library dependencies
			const { graphFromPackageDependencies } = await import("@ui5/project/graph");

			// log what happens now
			log.info(`\n\n\n[INFO] Found ${frameworkName} ${frameworkVersion}. Building framework to make it offline available. Please stay tuned, your app starts after the build...\n\n`);

			// build the project with all libraries
			const graph = await graphFromPackageDependencies({
				cwd: frameworkDir,
				rootConfigPath: "ui5.yaml",
			});
			const buildSettings = graph.getRoot().getBuilderSettings() || {};
			await graph.build({
				graph,
				destPath: frameworkDestDir,
				cleanDest: true,
				dependencyIncludes: {
					includeAllDependencies: true,
					defaultIncludeDependency: buildSettings.includeDependency,
					defaultIncludeDependencyRegExp: buildSettings.includeDependencyRegExp,
					defaultIncludeDependencyTree: buildSettings.includeDependencyTree,
				},
			});

			// ready marker
			await writeFile(frameworkReadyMarker, `${frameworkName}:${frameworkVersion}`, {
				encoding: "utf-8",
			});
		}

		// middleware to serve the built framework resources
		return async function serveResources(req, res, next) {
			try {
				const pathname = middlewareUtil.getPathname(req);
				let resource;
				if (pathname.startsWith("/resources/") || pathname.startsWith("/test-resources/")) {
					const resourcePath = path.join(frameworkDir, "dist", pathname);
					if (existsSync(resourcePath) && lstatSync(resourcePath).isFile()) {
						resource = resourcePath;
					}
				}

				if (!resource) {
					// Not found
					next();
					return;
				}

				const { contentType, charset } = middlewareUtil.getMimeInfo(resource);
				if (!res.getHeader("Content-Type")) {
					res.setHeader("Content-Type", contentType);
				}

				// Enable ETag caching
				res.setHeader("ETag", etag(await stat(resource)));

				if (
					fresh(req.headers, {
						etag: res.getHeader("ETag"),
					})
				) {
					// client has a fresh copy of the resource
					res.statusCode = 304;
					res.end();
					return;
				}

				res.end(await readFile(resource));
			} catch (err) {
				next(err);
			}
		};
	} else {
		// log what happens now
		if (isWorkspace) {
			log.warn(`\n\n\n\t\x1b[33mUI5 workspaces configuration used! Disabling ui5-middleware-serveframework!\x1b[0m\n\n`);
		} else {
			log.warn(`\n\n\n\t\x1b[33mNo framework configuration found in ui5.yaml! Disabling ui5-middleware-serveframework!\x1b[0m\n\n`);
		}

		// in any case, at least register a dummy middleware function
		return async function (req, res, next) {
			/* dummy middleware function */ next();
		};
	}
};

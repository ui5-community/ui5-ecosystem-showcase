/* eslint-disable no-unused-vars */
const path = require("path");
const { existsSync } = require("fs");
const { readFile, writeFile, mkdir, rm, stat } = require("fs").promises;
const yaml = require("js-yaml");

const etag = require("etag");
const fresh = require("fresh");

/**
 * Serves the built variant of the current framework
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @returns {Function} Middleware function to use
 */
module.exports = async ({ log, options, middlewareUtil }) => {
	// provide a set of default runtime options
	const effectiveOptions = {
		debug: false,
	};
	// config-time options from ui5.yaml for cfdestination take precedence
	if (options.configuration) {
		Object.assign(effectiveOptions, options.configuration);
	}

	// derive framework from current project
	const rootProject = middlewareUtil.getProject();
	const frameworkName = rootProject.getFrameworkName();

	// only if a framework is specified, the middleware gets active
	if (frameworkName) {
		// derive the npm scope and the version
		const frameworkScope = `@${frameworkName.toLowerCase()}`;
		const frameworkVersion = rootProject.getFrameworkVersion(); // TODO: how to determine the versionOverride?

		// all the data is stored in the `.ui5` folder
		const homeDir = require("os").homedir();
		const frameworkDir = path.resolve(homeDir, `.ui5/ui5-middleware-serveframework/${frameworkName.toLowerCase()}/${frameworkVersion}`);
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

			// support for coporate proxies
			const { getProxyForUrl } = await import("proxy-from-env");
			const proxyUrl = getProxyForUrl(baseUrl);
			const { HttpsProxyAgent } = await import("https-proxy-agent");
			const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
			effectiveOptions.debug && log.info(`[${baseUrl}] Proxy: ${proxyUrl ? proxyUrl : "n/a"}`);

			// fetch the version information for the concrete version from CDN
			const fetch = (await import("node-fetch")).default;
			await fetch(`${baseUrl}/${frameworkVersion}/resources/sap-ui-version.json`)
				.then((res) => res.json())
				.then((json) => writeFile(versionInfoFile, JSON.stringify(json), { encoding: "utf-8" }));
		}
		const versionInfo = JSON.parse(await readFile(versionInfoFile, { encoding: "utf-8" }));

		// lookup an existing locally built framework version or built a missing framework locally
		const frameworkPkgJson = path.resolve(frameworkDir, `package.json`);
		const frameworkUI5Yaml = path.resolve(frameworkDir, `ui5.yaml`);
		const frameworkWebappDir = path.join(frameworkDir, "webapp");
		const frameworkManifest = path.resolve(frameworkWebappDir, `manifest.json`);
		const frameworkDestDir = path.join(frameworkDir, "dist");
		const frameworkReadyMarker = path.join(frameworkDir, ".ready");
		const existsFramework = [frameworkPkgJson, frameworkUI5Yaml, frameworkManifest, frameworkDestDir, frameworkReadyMarker].reduce((prev, cur) => {
			return prev && existsSync(cur);
		});
		if (!existsFramework) {
			existsSync(frameworkWebappDir) && (await rm(frameworkWebappDir, { recursive: true }));
			existsSync(frameworkDestDir) && (await rm(frameworkDestDir, { recursive: true }));
			mkdir(frameworkWebappDir, { recursive: true });

			// create a dummy manifest to simulate a very basic application
			await writeFile(
				frameworkPkgJson,
				JSON.stringify(
					{
						name: frameworkName.toLowerCase(),
						version: frameworkVersion,
					},
					undefined,
					2
				),
				{
					encoding: "utf-8",
				}
			);

			// create a ui5.yaml to list all librar
			let ui5YamlContent = yaml.dump({
				specVersion: "3.0",
				metadata: {
					name: frameworkName.toLowerCase(),
				},
				type: "application",
				framework: {
					name: frameworkName,
					version: frameworkVersion,
					libraries: versionInfo.libraries
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
						}),
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
					2
				),
				{
					encoding: "utf-8",
				}
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
					if (existsSync(path.join(frameworkDir, "dist", pathname))) {
						resource = path.join(frameworkDir, "dist", pathname);
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
		log.warn(`\n\n\n[WARNING] No framework configuration found in ui5.yaml! Disabling ui5-middleware-serveframework!\n\n`);

		// in any case, at least register a dummy middleware function
		return async function (req, res, next) {
			/* dummy middleware function */ next();
		};
	}
};

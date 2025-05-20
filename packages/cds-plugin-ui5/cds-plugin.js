// >> IMPORTANT <<
//
// JEST has issues with dynamic imports and will fail when they are used,
// e.g. in the findUI5Modules the UI5 tooling is used which is implemented
// using ES modules. To avoid issues when running JEST tests, the plugin
// will be disabled by default but it can be enforced with CDS_PLUGIN_UI5_ACTIVE=true
// since JEST supports ES modules when using Node.js 21 and the experimental
// support for VM modules via:
//
//   > NODE_OPTIONS=--experimental-vm-modules jest
//
// Details can be found in the following issue:
//   - https://github.com/ui5-community/ui5-ecosystem-showcase/issues/901
//

// To disable JEST we rely on env variables (see https://jestjs.io/docs/environment-variables)
let skip = false;
if (process.env.NODE_ENV === "test" && process.env.JEST_WORKER_ID && process.env.CDS_PLUGIN_UI5_ACTIVE !== "true") {
	console.log(
		process.env.NO_COLOR ? "[%s] %s" : "\x1b[36m[%s]\x1b[0m \x1b[33m%s\x1b[0m",
		"cds-plugin-ui5",
		"Skip execution because JEST is running tests! To force the execution of the plugin set env var CDS_PLUGIN_UI5_ACTIVE=true...",
	);
	skip = true;
} else if (process.env.CDS_PLUGIN_UI5_ACTIVE === "false") {
	console.log(process.env.NO_COLOR ? "[%s] %s" : "\x1b[36m[%s]\x1b[0m \x1b[33m%s\x1b[0m", "cds-plugin-ui5", "Skip execution because it has been disabled by env var CDS_PLUGIN_UI5_ACTIVE!");
	skip = true;
}

// only execute the plugin if it should not be skipped
if (!skip) {
	// @sap/cds/lib/index.js#138: global.cds = cds // REVISIT: using global.cds seems wrong
	const cds = global.cds || require("@sap/cds"); // reuse already loaded cds!

	// add color support to the logger
	if (!(process.env.NO_COLOR || process.env.CDS_PLUGIN_UI5_NO_CUSTOM_LOGGER)) {
		const LOG_COLORS = {
			TRACE: "\x1b[0m", // default
			DEBUG: "\x1b[34m", // blue
			INFO: "\x1b[32m", // green
			WARN: "\x1b[33m", // yellow
			ERROR: "\x1b[31m", // red
		};
		const LOG_LEVEL_TO_COLOR = Object.fromEntries(Object.keys(LOG_COLORS).map((level) => [cds.log.levels[level], LOG_COLORS[level]]));
		const LOG_LEVEL_TO_TEXT = Object.fromEntries(Object.keys(LOG_COLORS).map((level) => [cds.log.levels[level], level]));
		cds.log.format = (label, level, ...args) => {
			return ["\x1b[36m[%s]\x1b[0m %s[%s]\x1b[0m %s", label, LOG_LEVEL_TO_COLOR[level], LOG_LEVEL_TO_TEXT[level], ...args];
		};
	}

	// create a logger for the cds-plugin-ui5
	const LOG = cds.log("cds-plugin-ui5");

	const findUI5Modules = require("./lib/findUI5Modules");
	const createPatchedRouter = require("./lib/createPatchedRouter");
	const applyUI5Middleware = require("./lib/applyUI5Middleware");
	const rewriteHTML = require("./lib/rewriteHTML");

	// identify whether the execution should be skipped
	if (process.env["ui5-middleware-cap"]) {
		LOG.info("Skip execution of plugin because is has been started via ui5-middleware-cap!");
		skip = true;
	} else if (process.env["dev-approuter"]) {
		LOG.info("Skip execution of plugin because is has been started via dev-approuter!");
		skip = true;
	}

	// only hook into lifecycle if the plugin should not be skipped
	if (!skip) {
		// marker that the cds-plugin-ui5 plugin is running
		// to disable the ui5-middleware-cap if used in apps
		process.env["cds-plugin-ui5"] = true;

		const { dirname, join, resolve, parse } = require("path");
		const { readFileSync, existsSync, realpathSync } = require("fs");
		const { execSync } = require("child_process");

		const { version: cdsPluginUI5Version } = require(`${__dirname}/package.json`);

		// function to resolve a module with the given paths without throwing an error
		const resolveModule = function resolveModule(moduleName, paths) {
			try {
				return require.resolve(moduleName, { paths });
				// eslint-disable-next-line no-unused-vars
			} catch (err) {
				return null;
			}
		};

		// helper to find the package.json in the current dir or upwards
		const findPackageJson = function findPackageJson(dir) {
			let currentDir = dir;
			while (currentDir !== resolve(currentDir, "..")) {
				const packageJsonPath = join(currentDir, "package.json");
				if (existsSync(packageJsonPath)) {
					return packageJsonPath;
				}
				currentDir = resolve(currentDir, "..");
			}
			return undefined;
		};

		// find out the CDS-DK version to control the behavior of the plugin
		const getCDSDKVersion = function getCDSDKVersion() {
			let cdsDkPath = process.argv[1];
			if (parse(cdsDkPath).name === "cds") {
				try {
					cdsDkPath = realpathSync(cdsDkPath);
					// eslint-disable-next-line no-unused-vars
				} catch (err) {
					// ignore
				}
				const cdsDkDir = dirname(cdsDkPath);
				const packageJsonPath = findPackageJson(cdsDkDir);
				if (packageJsonPath) {
					const packageJson = JSON.parse(readFileSync(packageJsonPath, { encoding: "utf-8" }));
					return packageJson.version;
				}
			}
			const moduleName = "@sap/cds-dk";
			let resolvedPath = resolveModule(`${moduleName}/package.json`);
			if (!resolvedPath) {
				const globalModulesPath = execSync("npm root -g").toString().trim();
				resolvedPath = resolveModule(`${moduleName}/package.json`, [globalModulesPath]);
			}
			if (resolvedPath) {
				const packageJson = JSON.parse(readFileSync(resolvedPath, { encoding: "utf-8" }));
				return packageJson.version;
			}
			return undefined;
		};

		// get the CDS-DK version to control the behavior of the plugin
		const cdsdkVersion = getCDSDKVersion();
		const logVersion = function () {
			// logging the version of the cds-plugin-ui5
			LOG.info(`Running cds-plugin-ui5@${cdsPluginUI5Version} (@sap/cds-dk@${cdsdkVersion}, @sap/cds@${cds.version})`);
			if (global.__cds_loaded_from?.size > 1) {
				LOG.warn("  !! Multiple versions of @sap/cds loaded !!");
				global.__cds_loaded_from.forEach((cdsPath) => {
					LOG.warn(`    => ${cdsPath}`);
				});
			}
		};

		// promise to await the bootstrap and lock the
		// served event to delay the startup a bit
		let bootstrapped;
		const bootstrapCompleted = new Promise((r) => {
			bootstrapped = r;
		});

		// hook into the "served" event to delay the startup of the
		// CDS server until the bootstrap is completed and the UI5
		// middlewares for the UI5 applications are properly available
		cds.on("served", async function served(/* cdsServices */) {
			LOG.debug("served");
			await bootstrapCompleted;
		});

		// hook into the "bootstrap" event to startup the UI5 middlewares
		// for the available UI5 applications in the CDS server and its deps
		cds.on("bootstrap", async function bootstrap(app) {
			LOG.debug("bootstrap");

			// only for cds serve or serving all services the cds-plugin-ui5 is active
			if (cds.cli?.command === "serve" || cds.options?.service === "all") {
				const cwd = cds.env?._home || process.cwd();
				const ui5Modules = await findUI5Modules({ cwd, cds, LOG });
				const { localApps, config } = ui5Modules;

				const links = [];

				// is lazy loading enabled?
				const isLazyLoadingEnabled = process.env["CDS_PLUGIN_UI5_LAZY_LOADING"] === "true";

				// log the version of the cds-plugin-ui5
				logVersion();

				// register the UI5 modules via their own router/middlewares
				for await (const ui5Module of ui5Modules) {
					const { moduleId, mountPath, modulePath } = ui5Module;

					// mounting the Router for the UI5 application to the CDS server
					LOG.info(`Mounting ${mountPath} to UI5 app ${modulePath} (id=${moduleId})${config[moduleId] ? ` using config=${JSON.stringify(config[moduleId])}` : ""}`);

					// create a patched router
					const router = createPatchedRouter();

					// determine the application info and apply the UI5 middlewares (maybe lazy)
					applyUI5Middleware(router, {
						cwd,
						basePath: modulePath,
						...(config[moduleId] || {}),
						LOG,
						lazy: isLazyLoadingEnabled,
						//logPerformance: true,
					}).then(({ pages }) => {
						// append the HTML pages to the links
						pages.forEach((page) => {
							const prefix = mountPath !== "/" ? mountPath : "";
							links.push(`${prefix}${page}`);
						});
					});

					// register the router to the specified mount path
					app.use(mountPath, router);
				}

				// identify whether the welcome page should be rewritten
				let rewrite = links.length > 0;

				// rewrite the welcome page
				if (rewrite || isLazyLoadingEnabled) {
					// register the custom middleware (similar like in @sap/cds/server.js)
					app.get("/", function appendLinksToIndex(req, res, next) {
						req._cds_plugin_ui5 = true; // marker for patched router to ignore
						rewriteHTML(
							req,
							res,
							() => true,
							(doc) => {
								// the first <ul> element contains the links to the
								// application pages which is fully under control of
								// our plugin now and we keep all links to static
								// pages to ensure coop with classic apps
								const head = doc.getElementsByTagName("head")?.[0];
								head?.insertAdjacentHTML(
									"beforeend",
									`<style>
								a.ui5:after {
									content: "UI5";
									font-weight: bold;
									font-size: 0.5rem;
									vertical-align: super;
									margin: 0.25rem;
									color: #1873B4;
								}
								@media (prefers-color-scheme: dark) {
									a.ui5:after {
										color: #FF5A37;
									}
								}
								</style>`,
								);
								const ul = doc.getElementsByTagName("ul")?.[0];
								if (ul) {
									const newLis = [];
									const lis = ul.getElementsByTagName("li");
									lis?.forEach((li) => {
										const appDir = li.firstChild?.text?.split("/")?.[1];
										if (localApps.has(appDir)) {
											newLis.push(li.toString());
										}
									});
									newLis.push(
										...links.sort().map((link) => {
											// we remove the query parameters from the link text
											const linkText = link.indexOf("?") === -1 ? link : link.substr(0, link.indexOf("?"));
											// renders a UI5 link ;-)
											return `<li><a class="ui5" href="${link}">${linkText}</a></li>`;
										}),
									);
									ul.innerHTML = newLis.join("\n");
								} else {
									LOG.warn(`Failed to inject application links into CDS index page!`);
								}
							},
						);
						next();
					});

					// move our middleware before the CDS index serve middleware to
					// allow that we can intercept the response and modify it to
					// inject our application pages an remove the exitsing ones
					const middlewareStack = app?._router?.stack;
					if (Array.isArray(middlewareStack)) {
						const cmw = middlewareStack.pop();
						const idxOfServeStatic = middlewareStack.findIndex((layer) => layer.name === "serveStatic");
						if (idxOfServeStatic !== -1) {
							middlewareStack.splice(idxOfServeStatic, 0, cmw);
						} else {
							LOG.error(`Failed to determine welcome page middleware! The links of the application pages may not work properly!`);
						}
					} else {
						LOG.error(`Failed to inject application pages to welcome page! The links of the application pages may not work properly!`);
					}
				}
			} else {
				LOG.info("Skip execution of plugin! The plugin is only active for 'cds serve'!");
			}

			// bootstrap completed, unlock the "served" event
			bootstrapped();
		});

		// check if the register function for build tasks is available at the cds object
		// and if the Plugin class is available to register the cds build task to cover
		// the tracks of the cds-plugin-ui5 workspace configuration and dependencies
		const { minVersion, satisfies } = require("semver");
		if (typeof cds.build?.register === "function" && typeof cds.build?.Plugin?.constructor === "function") {
			const { readFile, writeFile } = require("fs").promises;
			const { existsSync } = require("fs");
			const { join } = require("path");
			const util = require("util");
			const exec = util.promisify(require("child_process").exec);

			// log the version of the cds-plugin-ui5
			logVersion();

			// helper to check whether a semantic version is valid
			const valid = (version) => {
				try {
					return minVersion(version) !== null;
					// eslint-disable-next-line no-unused-vars
				} catch (err) {
					return false;
				}
			};

			// register the cds build task to sanitize the package.json and update the package-lock.json
			cds.build.register(
				"ui5",
				/**
				 * CDS Build Plugin to ensure that the workspace configuration and the workspace dev
				 * dependencies are removed and finally runs the npm install --package-lock-only to
				 * update the package-lock.json
				 */
				class UI5Plugin extends cds.build.Plugin {
					static taskDefaults = { src: cds.env.folders.srv };
					static hasTask() {
						return true; // plugin is a cds build task
					}
					init() {}
					clean() {
						if (!satisfies(cdsdkVersion, ">=8")) {
							this._priority = -1; // hack to ensure that the task is executed last!
						}
					}
					get priority() {
						if (!satisfies(cdsdkVersion, ">=8")) {
							return this._priority || 1;
						} else {
							return -1;
						}
					}
					async build() {
						// determine the namespace from the model
						const model = await this.model();
						if (!model) return;
						const namespace = model.namespace || "<unknown>";
						// sanitize the package.json if it exists
						const packageJsonPath = join(this.task.dest, "package.json");
						if (existsSync(packageJsonPath)) {
							LOG.info(`Sanitizing the package.json for "${namespace}"...`);
							const packageJson = JSON.parse(await readFile(packageJsonPath), "utf-8");
							let modified = false;
							// remove the workspace configuration
							if (packageJson.workspaces) {
								delete packageJson.workspaces;
								modified = true;
							}
							// remove the workspace dev dependencies and the cds-plugin-ui5
							if (packageJson.devDependencies) {
								packageJson.devDependencies = Object.entries(packageJson.devDependencies).reduce((acc, [dep, version]) => {
									if (valid(version) && dep !== "cds-plugin-ui5") {
										acc[dep] = version;
									}
									return acc;
								}, {});
								modified = true;
							}
							// overwrite the package.json if it was modified only
							if (modified) {
								await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf-8");
							}
						}
						// update the package-lock.json if it exists
						if (existsSync(join(this.task.dest, "package-lock.json"))) {
							LOG.info(`Updating the package-lock.json for "${namespace}"...`);
							// run the npm install --package-lock-only to only update the package-lock.json
							// without installing the dependencies to node_modules
							try {
								/* const { stdout, stderr } = */ await exec("npm install --package-lock-only", { cwd: this.task.dest });
							} catch (e) {
								LOG.error(`Failed to update the package-lock.json for "${namespace}"! Error: ${e.code} - ${e.message}`);
							}
						}
					}
				},
			);
		} else {
			if (!satisfies(cdsdkVersion, ">=7.5.0")) {
				// TODO: add error message to inform the user that the cds build task is not available
				//       and that the @sap/cds-dk version is too old to support the cds build task
				LOG.warn(`The cds build task requires @sap/cds-dk version >= 7.5.0! Skipping execution as your @sap/cds-dk version ${cdsdkVersion} is too old...`);
			}
		}
	}
}

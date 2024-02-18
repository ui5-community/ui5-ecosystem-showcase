const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

const log = require("./log");

/**
 * @typedef UI5Module
 * @type {object}
 * @property {string} moduleId package name of the module
 * @property {string} modulePath root path of the module
 * @property {string} mountPath path to mount the module to
 */

/**
 * Returns all UI5 modules from local apps and the project dependencies.
 * @param {object} options configuration options
 * @param {string} options.cwd current working directory
 * @param {string} options.cds reference to cds
 * @param {string} options.skipLocalApps skip local apps
 * @param {string} options.skipDeps skip dependencies
 * @returns {Array<UI5Module>} array of UI5 module
 */
module.exports = async function findUI5Modules({ cwd, cds, skipLocalApps, skipDeps }) {
	// extract the modules configuration from the package.json
	const pkgJson = require(path.join(cwd, "package.json"));

	// determine module configuration:
	//   => env variable: CDS_PLUGIN_UI5_MODULES (JSONObject<string, object>)
	//   => package.json: cds-plugin-ui5 > modules (JSONObject<string, object>)
	// JSONObject<string, object>: key = moduleId (folder name, npm package name), object={ configFile: string, ... }
	let modulesConfig;
	try {
		modulesConfig = JSON.parse(process.env.CDS_PLUGIN_UI5_MODULES);
		log.info(`Using modules configuration from env`);
	} catch (err) {
		modulesConfig = pkgJson.cds?.["cds-plugin-ui5"]?.modules;
	}
	if (modulesConfig) {
		log.debug(`Found modules configuration: ${JSON.stringify(modulesConfig, undefined, 2)}`);
	}

	// helper to determine the ui5.yaml for the dependency or directory
	const determineUI5Yaml = function determineUI5Yaml(depOrDir) {
		let module = depOrDir;
		if (path.isAbsolute(depOrDir)) {
			module = path.basename(depOrDir);
		}
		return modulesConfig?.[module]?.configFile || "ui5.yaml";
	};

	// lookup the app folder to determine local apps and UI5 apps
	const localApps = new Set();
	const appDirs = [];
	if (!skipLocalApps) {
		const appDir = path.join(cwd, cds.env?.folders?.app || "app");
		if (fs.existsSync(appDir)) {
			// is the UI5 app directly in the app directory?
			if (!fs.existsSync(path.join(appDir, determineUI5Yaml(appDir)))) {
				// lookup all dirs inside the root app directory for
				// being either a local app or a UI5 application
				fs.readdirSync(appDir, { withFileTypes: true })
					.filter((f) => f.isDirectory())
					.forEach((d) => localApps.add(d.name));
				localApps.forEach((e) => {
					const d = path.join(appDir, e);
					if (fs.existsSync(path.join(d, determineUI5Yaml(d)))) {
						localApps.delete(e);
						appDirs.push(d);
					}
				});

				// also include all root app directory HTML files if no ui5.yaml is present
				fs.readdirSync(appDir, { withFileTypes: true })
					.filter((f) => {
						return f.isFile();
					})
					.forEach((f) => {
						localApps.add(f.name);
					});
			} else {
				// if a ui5.yaml is present in the root app directory consider this
				// as a UI5 application to be included into the mounting
				if (appDirs.length === 0) {
					appDirs.push(appDir);
				}
			}
		}
	}

	// lookup the UI5 modules in the project dependencies
	if (!skipDeps) {
		const deps = [];
		deps.push(...Object.keys(pkgJson.dependencies || {}));
		deps.push(...Object.keys(pkgJson.devDependencies || {}));
		//deps.push(...Object.keys(pkgJson.peerDependencies || {}));
		//deps.push(...Object.keys(pkgJson.optionalDependencies || {}));
		appDirs.push(
			...deps.filter((dep) => {
				try {
					require.resolve(path.join(dep, determineUI5Yaml(dep)), {
						paths: [cwd],
					});
					return true;
				} catch (e) {
					return false;
				}
			})
		);
	}

	// if apps are available, attach the middlewares of the UI5 apps
	// to the express of the CDS server via a express router
	const apps = [];
	apps.config = {};
	if (appDirs) {
		for await (const appDir of appDirs) {
			// read the ui5.yaml file to extract the configuration
			const ui5YamlPath = require.resolve(path.join(appDir, determineUI5Yaml(appDir)), {
				paths: [cwd],
			});
			let ui5Configs;
			try {
				const content = fs.readFileSync(ui5YamlPath, "utf-8");
				ui5Configs = yaml.loadAll(content);
			} catch (err) {
				if (err.name === "YAMLException") {
					log.error(`Failed to read ${ui5YamlPath}!`);
				}
				throw err;
			}

			// extract the configuration
			const ui5Config = ui5Configs?.[0];
			const isApplication = ui5Config?.type === "application";
			if (isApplication) {
				// determine the module path based on the location of the ui5.yaml
				const modulePath = path.dirname(ui5YamlPath);

				// manually get the module name as defined in package.json
				// skipDeps is only true if we are looking for UI5 apps inside a CDS
				// server project in all other cases the module name equals the appDir
				let moduleName;
				if (skipDeps) {
					const packageJsonPath = require.resolve(path.join(appDir, "package.json"), {
						paths: [cwd],
					});
					const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
					moduleName = JSON.parse(packageJsonContent).name;
				}
				const moduleId = moduleName || path.basename(appDir);

				// by default the mount path is derived from the "metadata/name"
				// and can be overridden by "customConfiguration/mountPath" or
				// by "customConfiguration/cds-plugin-ui5/mountPath" or by
				// the following configuration entry in the package.json of CDS
				// server: "cds/cds-plugin-ui5/modules/%moduleId%/mountPath"
				let mountPath =
					modulesConfig?.[moduleId]?.mountPath || ui5Config?.customConfiguration?.["cds-plugin-ui5"]?.mountPath || ui5Config?.customConfiguration?.mountPath || ui5Config?.metadata?.name;
				if (!/^\//.test(mountPath)) {
					mountPath = `/${mountPath}`; // always start with /
				}

				// store the custom config in the configuration map
				if (modulesConfig?.[moduleId]) {
					apps.config[moduleId] = modulesConfig[moduleId];
				}

				apps.push({ moduleId, modulePath, mountPath });
			}
		}
	}
	apps.localApps = localApps; // necessary for CDS index.html rewrite

	// return the apps
	return apps;
};

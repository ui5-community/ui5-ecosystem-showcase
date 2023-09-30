// based on "packages/cds-plugin-ui5/lib/findUI5Modules.js"

const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

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
 * @param {object} options.config configuration object
 * @param {string} options.log reference to a logger
 * @returns {Array<UI5Module>} array of UI5 module
 */
module.exports = async function findUI5Modules({ cwd, config, log }) {
	// lookup the UI5 modules in the project dependencies
	const pkgJson = require(path.join(cwd, "package.json"));
	const appDirs = [],
		deps = [];
	deps.push(...Object.keys(pkgJson.dependencies || {}));
	deps.push(...Object.keys(pkgJson.devDependencies || {}));
	//deps.push(...Object.keys(pkgJson.peerDependencies || {}));
	//deps.push(...Object.keys(pkgJson.optionalDependencies || {}));
	appDirs.push(
		...deps.filter((dep) => {
			try {
				require.resolve(`${dep}/ui5.yaml`, {
					paths: [cwd],
				});
				return true;
			} catch (e) {
				return false;
			}
		})
	);

	// if apps are available, attach the middlewares of the UI5 apps
	// to the express of the CDS server via a express router
	const apps = [];
	apps.config = {};
	if (appDirs) {
		for await (const appDir of appDirs) {
			// read the ui5.yaml file to extract the configuration
			const ui5YamlPath = require.resolve(path.join(appDir, "ui5.yaml"), {
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
				const packageJsonPath = require.resolve(path.join(appDir, "package.json"), {
					paths: [cwd],
				});
				const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
				const moduleId = JSON.parse(packageJsonContent).name;

				// by default the mount path is derived from the "metadata/name"
				// and can be overridden by "customConfiguration/mountPath" or
				// by "customConfiguration/ui5-middleware-ui5/mountPath" or by
				// the following configuration entry in the ui5.yaml:
				// - name: ui5-middleware-ui5
				//   afterMiddleware: compression
				//   configuration:
				//     modules:
				// 	     %moduleId%:
				// 	       mountPath: "/app"
				let mountPath =
					config?.modules?.[moduleId]?.mountPath ||
					ui5Config?.customConfiguration?.["ui5-middleware-ui5"]?.mountPath ||
					ui5Config?.customConfiguration?.mountPath ||
					ui5Config?.metadata?.name;
				if (!/^\//.test(mountPath)) {
					mountPath = `/${mountPath}`; // always start with /
				}

				apps.push({ moduleId, modulePath, mountPath });
			}
		}
	}

	// return the apps
	return apps;
};

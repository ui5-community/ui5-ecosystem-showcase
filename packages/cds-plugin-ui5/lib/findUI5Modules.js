const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

const log = require("./log");

/**
 * @typedef UI5Module
 * @type {object}
 * @property {string} modulePath root path of the module
 * @property {string} mountPath path to mount the module to
 */

/**
 * Returns all UI5 modules from local apps and the project dependencies.
 * @param {object} options configuration options
 * @param {string} options.cwd current working directory
 * @param {string} options.skipLocalApps skip local apps
 * @param {string} options.skipDeps skip dependencies
 * @returns {Array<UI5Module>} array of UI5 module
 */
module.exports = async function findUI5Modules({ cwd, skipLocalApps, skipDeps }) {
	// lookup the app folder to determine local apps and UI5 apps
	const localApps = new Set();
	const appDirs = [];
	if (!skipLocalApps) {
		const appDir = path.join(cwd, "app");
		if (fs.existsSync(appDir)) {
			fs.readdirSync(appDir, { withFileTypes: true })
				.filter((f) => f.isDirectory())
				.forEach((d) => localApps.add(d.name));
			localApps.forEach((e) => {
				const d = path.join(appDir, e);
				if (fs.existsSync(path.join(d, "ui5.yaml"))) {
					localApps.delete(e);
					appDirs.push(d);
				}
			});
		}

		// look for a single app if no apps were found in the app directories
		if (appDirs.length === 0) {
			if (fs.existsSync(path.join(appDir, "ui5.yaml"))) {
				appDirs.push(appDir);
			}
		}
	}

	// lookup the UI5 modules in the project dependencies
	if (!skipDeps) {
		const pkgJson = require(path.join(cwd, "package.json"));
		const deps = [];
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
	}

	// if apps are available, attach the middlewares of the UI5 apps
	// to the express of the CAP server via a express router
	const apps = [];
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
					log("error", `Failed to read ${ui5YamlPath}!`);
				}
				throw err;
			}

			// by default the mount path is derived from the metadata/name
			// and can be overridden by customConfiguration/mountPath
			const ui5Config = ui5Configs?.[0];
			const isApplication = ui5Config?.type === "application";
			if (isApplication) {
				let mountPath = ui5Config?.customConfiguration?.mountPath || ui5Config?.metadata?.name;
				if (!/^\//.test(mountPath)) {
					mountPath = `/${mountPath}`; // always start with /
				}

				// determine the module path based on the location of the ui5.yaml
				const modulePath = path.dirname(ui5YamlPath);
				apps.push({ modulePath, mountPath });
			}
		}
	}
	apps.localApps = localApps; // necessary for CAP index.html rewrite
	return apps;
};

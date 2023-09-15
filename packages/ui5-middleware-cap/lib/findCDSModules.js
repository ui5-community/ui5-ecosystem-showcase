const path = require("path");
const fs = require("fs");

function existsDir(path) {
	return fs.existsSync(path) && fs.statSync(path).isDirectory();
}

/**
 * @typedef CDSModule
 * @type {object}
 * @property {string} moduleId id of the module
 * @property {string} modulePath root path of the module
 */

/**
 * Returns all CDS modules in the project dependencies.
 * @param {object} options configuration options
 * @param {string} options.cwd current working directory
 * @returns {Array<CDSModule>} array of CDS modules
 */
module.exports = async function findCDSModules({ cwd }) {
	// lookup the CDS server from dependencies
	const pkgJson = require(path.join(cwd, "package.json"));
	const deps = [];
	deps.push(...Object.keys(pkgJson.dependencies || {}));
	deps.push(...Object.keys(pkgJson.devDependencies || {}));
	//deps.push(...Object.keys(pkgJson.peerDependencies || {}));
	//deps.push(...Object.keys(pkgJson.optionalDependencies || {}));
	const cdsModules = deps
		.filter((dep) => {
			// ignore the @sap/cds module! ;-)
			if (dep === "@sap/cds") {
				return false;
			}
			// try to identify the CDS server module
			try {
				// we only consider npm packages having a package.json because
				// otherwise require.resolve will cause an exception if not found
				const pkgJsonFile = require.resolve(path.join(dep, "package.json"), {
					paths: [cwd],
				});
				// if the package.json has a cds section, we assume it is the CDS server module
				const pkgJson = JSON.parse(fs.readFileSync(pkgJsonFile, { encoding: "utf8" }));
				if (pkgJson.cds) {
					return true;
				}
				// if the package.json has a dependency to @sap/cds and the db and srv dir exists
				// we also assume it is the CDS server module
				if (Object.keys(pkgJson.dependencies || {}).includes("@sap/cds") && existsDir(path.join(path.dirname(pkgJsonFile), "db")) && existsDir(path.join(path.dirname(pkgJsonFile), "srv"))) {
					return true;
				}
				// if we can find a .cdsrc.json in the project we assume it is a CDS server module
				// otherwise require.resolve will cause an exception if not found
				require.resolve(path.join(dep, ".cdsrc.json"), {
					paths: [cwd],
				});
				return true;
			} catch (e) {
				return false;
			}
		})
		.map((dep) => {
			return {
				moduleId: dep,
				modulePath: path.dirname(
					require.resolve(`${dep}/package.json`, {
						paths: [cwd],
					})
				),
			};
		});
	return cdsModules;
};

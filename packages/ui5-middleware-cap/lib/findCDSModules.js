const path = require("path");
const fs = require("fs");

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
			// either a cds section is in the package.json
			// or the .cdsrc.json exists in the module dir
			try {
				const pkgJsonFile = require.resolve(`${dep}/package.json`, {
					paths: [cwd],
				});
				const pkgJson = JSON.parse(fs.readFileSync(pkgJsonFile, { encoding: "utf8" }));
				if (!pkgJson.cds) {
					require.resolve(`${dep}/.cdsrc.json`, {
						paths: [cwd],
					});
				}
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

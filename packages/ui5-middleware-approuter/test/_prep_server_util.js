const fs = require("fs-extra")
const path = require("path")
const replace = require("replace-in-file")

/**
 * @typedef UI5ServerConfig
 * @property {object} ui5
 * @property {string} ui5.yaml full path to the prepped ui5.yaml
 * @property {object} xsapp
 * @property {string} xsapp.json full path to the prepped xs-app.json
 * @property {object} defaultEnv
 * @property {string} [defaultEnv.json] full path to the prepped default-env.json
 */
/**
 * prep the ui5 server runtime for test case - ui5.yaml, xs-app.json, default-env.json
 *
 * @param {object} config
 * @param {string} config.ui5Yaml path to the ui5.yaml that should be used in the test case
 * @param {number} config.appRouterPort port the app router should be started on
 * @param {string} config.xsAppJson path to the xs-app.json that should be used in the test case
 * @param {string} [config.defaultEnvJson] path to the default-env.json that should be used in the test case
 * @param {string} config.tmpDir temporary directory all of the config files should be copied to
 * @returns {UI5ServerConfig} full path to the test fixtures of ui5.yaml, xsapp.json and defaultEnv.json (the latter is an empty object if not provided as an input parameter)
 */
async function prepUI5ServerConfig({ ui5Yaml, appRouterPort, xsAppJson, defaultEnvJson, tmpDir }) {
	// replace default port 1091 for app router w/ random port
	await fs.copyFile(path.resolve(ui5Yaml), `${tmpDir}/ui5.yaml`) // copy orig ui5.yaml test fixture
	const _ui5Yaml = await replace({ files: path.resolve(`${tmpDir}/ui5.yaml`), from: "1091", to: appRouterPort }) // replace port config in file
	const ui5 = { yaml: _ui5Yaml[0].file }

	const _xsapp = { json: path.resolve(xsAppJson) }
	const xsapp = { json: path.resolve(tmpDir, "xs-app.json") }
	// we always need the routes
	const _promises = [fs.copy(_xsapp.json, xsapp.json)]

	// auth info only on-demand
	let defaultEnv = {}
	if (defaultEnvJson) {
		const _defaultEnv = { json: path.resolve(defaultEnvJson) }
		defaultEnv = { json: path.resolve(tmpDir, "default-env.json") }
		_promises.push(fs.copy(_defaultEnv.json, defaultEnv.json))
	}

	// prep routes (+ authentication) config
	await Promise.all(_promises)

	// return resolved path to config files for re-use in tests
	return {
		ui5,
		xsapp,
		defaultEnv // this return the empty object in case no input defaultEnvJson was provided
	}
}

module.exports = prepUI5ServerConfig

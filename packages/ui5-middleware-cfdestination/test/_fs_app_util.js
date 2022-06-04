const fs = require("fs-extra")
const path = require("path")

/**
 * copy showcase ui5 app for test purposes
 * and rm included ui5.yaml and xs-app.json
 *
 * @param {string} tmpDir path to copy ui5 app (that acts as the test app to)
 */
async function copyUI5app(tmpDir) {
	await fs.mkdirs(tmpDir)
	const filterFn = (src, _) => {
		const yo = ["node_modules", "dist", "ui5.yaml", "xs-app.json"].find((node) => src.endsWith(node))
		if (yo === "node_modules") {
			createSymlink(src, _)
		}
		return yo === undefined ? true : false
	}
	await fs.copy(path.resolve(__dirname, "../../ui5-app"), tmpDir, {
		filter: filterFn
	})
}

async function createSymlink(src, dest) {
	await fs.ensureDir(path.dirname(dest))
	await fs.remove(dest)
	await fs.symlink(src, dest)
}

module.exports = copyUI5app

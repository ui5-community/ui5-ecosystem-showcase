const { mkdir, cp, rmdir, symlink } = require("fs").promises
const path = require("path")

/**
 * copy showcase ui5 app for test purposes
 * and rm included ui5.yaml and xs-app.json
 *
 * @param {string} tmpDir path to copy ui5 app (that acts as the test app to)
 */
async function copyUI5app(tmpDir) {
	await mkdir(tmpDir, { recursive: true })
	await cp(path.resolve(__dirname, "../../../showcases/ui5-app"), tmpDir, {
		filter: async (src, _) => {
			const yo = ["node_modules", "dist", "ui5.yaml", "xs-app.json"].find((node) => src.endsWith(node))
			if (yo === "node_modules") {
				await symlink(src, _)
			}
			return yo === undefined ? true : false
		},
		recursive: true
	})
	//console.log(tmpDir);
}

module.exports = copyUI5app

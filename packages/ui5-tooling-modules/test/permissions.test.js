const { default: test } = require("ava");
const path = require("path");
const fs = require("fs");
const { tmpdir } = require("os");

// Simulate an ancestor directory which can be traversed but not listed (e.g. mode 711).
// fs.readdirSync is patched before lib/util is required, as lib/util destructures it on load.
// (A real chmod would not work on Windows and is ignored when running as root.)
const tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(tmpdir(), "ui5-tooling-modules-permissions-")));
const restrictedDir = path.join(tmpDir, "restricted");
const readdirSync = fs.readdirSync;
fs.readdirSync = function (dir, ...args) {
	if (path.resolve(String(dir)) === restrictedDir) {
		const err = new Error(`EACCES: permission denied, scandir '${dir}'`);
		err.code = "EACCES";
		err.syscall = "scandir";
		err.path = String(dir);
		throw err;
	}
	return readdirSync.call(this, dir, ...args);
};

const util = require("../lib/util")({ verbose() {}, info() {}, warn() {}, error() {} }, { pkgJson: { name: "permissions-test-project", dependencies: {} } });

test.after.always(() => {
	fs.readdirSync = readdirSync;
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("Resolve a module below an ancestor directory which can't be listed", (t) => {
	const nodeModules = path.join(restrictedDir, "app", "node_modules");
	const packageRoot = path.join(nodeModules, "permissions-test");
	fs.mkdirSync(path.join(packageRoot, "dist"), { recursive: true });
	fs.writeFileSync(path.join(packageRoot, "package.json"), JSON.stringify({ name: "permissions-test", main: "./dist/index.js" }));
	fs.writeFileSync(path.join(packageRoot, "dist", "index.js"), "export default 42;\n");

	t.throws(() => fs.readdirSync(restrictedDir), { code: "EACCES" }, "the restricted directory must not be listable");
	// absolute module paths are checked case-sensitively up to the root (and the file extension is added)
	t.is(util.resolveModule(path.join(packageRoot, "dist", "index"), { cwd: process.cwd() }), path.join(packageRoot, "dist", "index.js"));
});

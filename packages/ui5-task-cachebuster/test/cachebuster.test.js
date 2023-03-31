const path = require("path");
const { mkdirSync, rmSync, existsSync, readFileSync } = require("fs");
const { spawnSync } = require("child_process");
const crypto = require("crypto");

const test = require("ava");

test.beforeEach(async (t) => {
	// prepare
	t.context.tmpDir = path.resolve(`./test/__dist__/${crypto.randomBytes(5).toString("hex")}`);
	mkdirSync(t.context.tmpDir);
});

test.afterEach.always(async (t) => {
	// cleanup
	rmSync(t.context.tmpDir, { recursive: true, force: true });
});

// eslint-disable-next-line jsdoc/require-jsdoc
function readResourceRootsIndex(index) {
	const content = readFileSync(index, "utf8");
	const sRegex = /data-sap-ui-resourceroots.*=.*'(.*)'/;
	var sResourceRoots = content.match(sRegex)[1];
	return JSON.parse(sResourceRoots);
}

test("build with defaults", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5.basic.yaml") };
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-app"),
	});
	// default options move Resources and update index.html
	// timestamp folder exsists
	// index.html is in root and has timestamp in resourceroots
	const index = path.resolve(t.context.tmpDir, "dist", "index.html");
	t.true(existsSync(index));

	const oResouceRoots = readResourceRootsIndex(index);
	const aModuleNames = Object.keys(oResouceRoots);
	const sModulePath = oResouceRoots[aModuleNames[0]];
	const parts = sModulePath.split("~");
	const timestamp = parts[1];
	const timestampDir = path.resolve(t.context.tmpDir, "dist", `~${timestamp}~/`);

	t.true(existsSync(timestampDir));
});

test("only update index.html", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5.onlyIndex.yaml") };
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-app"),
	});
	// no timestamp folder
	const index = path.resolve(t.context.tmpDir, "dist", "index.html");
	t.true(existsSync(index));

	var oResouceRoots = readResourceRootsIndex(index);
	const aModuleNames = Object.keys(oResouceRoots);
	const sModulePath = oResouceRoots[aModuleNames[0]];
	const parts = sModulePath.split("~");
	const timestamp = parts[1];
	const timestampDir = path.resolve(t.context.tmpDir, "dist", `~${timestamp}~`);
	t.false(existsSync(timestampDir));
});

test("more than default from-move-excluded resources", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5.onlyMove.yaml") };
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-app"),
	});
	// excluded resources also in root folder
	const index = path.resolve(t.context.tmpDir, "dist", "index.html");
	t.false(existsSync(index));
	const manifest = path.resolve(t.context.tmpDir, "dist", "manifest.json");
	t.true(existsSync(manifest));
	const component = path.resolve(t.context.tmpDir, "dist", "Component.js");
	t.true(existsSync(component));
});

test("no excluded resources", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5.noExcluded.yaml") };
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-app"),
	});
	// no files in root
	const index = path.resolve(t.context.tmpDir, "dist", "index.html");
	t.false(existsSync(index));
});


const fs = require("fs-extra");
const path = require("path");
const { spawnSync } = require("child_process");

const tmpDir = "./test/tmp";
jest.setTimeout(9000);

beforeEach(async () => {
    // cleanup
    return fs.mkdir(tmpDir);

  });

afterEach(async () => {
    // cleanup
    return fs.remove(tmpDir);
  });

  function readResourceRootsIndex(index){

	const content = fs.readFileSync(index, 'utf8');
	const sRegex = /data-sap-ui-resourceroots.*=.*'(.*)'/;
	var sResourceRoots = content.match(sRegex)[1];
	return JSON.parse(sResourceRoots);

  }

  test("build with defaults", () => {
	console.log(1)
    const ui5 = { yaml: path.resolve("./test/__assets__/ui5.basic.yaml") };
    spawnSync(`ui5 build --config ${ui5.yaml} --dest ../ui5-task-cachebuster/${tmpDir}/dist`, {
      stdio: "inherit", // > don't include stdout in test output,
      shell: true,
      cwd: path.resolve(__dirname, "../../ui5-app"),
    });
    // default options move Resources and update index.html
    // timestamp folder exsists
    // index.html is in root and has timestamp in resourceroots
    const index = path.resolve(tmpDir, "dist", "index.html");
    expect(fs.existsSync(index)).toBeTruthy();

	const oResouceRoots = readResourceRootsIndex(index);
	const aModuleNames = Object.keys(oResouceRoots);
	const sModulePath = oResouceRoots[aModuleNames[0]];
	const parts = sModulePath.split("~");
	const timestamp = parts[1];
	const timestampDir = path.resolve(tmpDir, "dist", `~${timestamp}~/`);

	expect(fs.existsSync(timestampDir)).toBeTruthy();

  });

  test("only update index.html", () => {
	console.log(2)
    const ui5 = { yaml: path.resolve("./test/__assets__/ui5.onlyIndex.yaml") };
    var res = spawnSync(`ui5 build --config ${ui5.yaml} --dest ../ui5-task-cachebuster/${tmpDir}/dist`, {
      stdio: "inherit", // > don't include stdout in test output,
      shell: true,
      cwd: path.resolve(__dirname, "../../ui5-app"),
    });
    // no timestamp folder
	const index = path.resolve(tmpDir, "dist", "index.html");
    expect(fs.existsSync(index)).toBeTruthy();

	var oResouceRoots = readResourceRootsIndex(index);
	const aModuleNames = Object.keys(oResouceRoots);
	const sModulePath = oResouceRoots[aModuleNames[0]];
	const parts = sModulePath.split("~");
	const timestamp = parts[1];
	const timestampDir = path.resolve(tmpDir, "dist", `~${timestamp}~`);
	expect(fs.existsSync(timestampDir)).toBeFalsy();

  });
  /*
  //test("index.html has more than one resource root path",  () => { //TODO how to ?
  //  const ui5 = { yaml: path.resolve("./test/__assets__/ui5.onlyIndex.yaml") };
  //  spawnSync(`ui5 build --config ${ui5.yaml} --dest ../ui5-task-cachebuster/${tmpDir}/dist`, {
  //    stdio: "inherit", // > don't include stdout in test output,
  //    shell: true,
  //    cwd: path.resolve(__dirname, "../../ui5-app"),
  //  });
  //  // both resource roots with timestamp path
  //});

  test("only move files", () => {
    const ui5 = { yaml: path.resolve("./test/__assets__/ui5.onlyMove.yaml") };
    spawnSync(`ui5 build --config ${ui5.yaml} --dest ../ui5-task-cachebuster/${tmpDir}/dist`, {
      stdio: "inherit", // > don't include stdout in test output,
      shell: true,
      cwd: path.resolve(__dirname, "../../ui5-app"),
    });
    // timestamp folder exsists
    // index.html not changed

  });
*/
  test("more than default from-move-excluded resources", () => {
	console.log(3)
    const ui5 = { yaml: path.resolve("./test/__assets__/ui5.onlyMove.yaml") };
    spawnSync(`ui5 build --config ${ui5.yaml} --dest ../ui5-task-cachebuster/${tmpDir}/dist`, {
      stdio: "inherit", // > don't include stdout in test output,
      shell: true,
      cwd: path.resolve(__dirname, "../../ui5-app"),
    });
    // excluded resources also in root folder
	const index = path.resolve(tmpDir, "dist", "index.html");
    expect(fs.existsSync(index)).toBeFalsy();
	const manifest = path.resolve(tmpDir, "dist", "manifest.json");
    expect(fs.existsSync(manifest)).toBeTruthy();
	const component = path.resolve(tmpDir, "dist", "Component.js");
    expect(fs.existsSync(component)).toBeTruthy();

  });
  test("no excluded resources", () => {
	console.log(4)
    const ui5 = { yaml: path.resolve("./test/__assets__/ui5.noExcluded.yaml") };
    spawnSync(`ui5 build --config ${ui5.yaml} --dest ../ui5-task-cachebuster/${tmpDir}/dist`, {
      stdio: "inherit", // > don't include stdout in test output,
      shell: true,
      cwd: path.resolve(__dirname, "../../ui5-app"),
    });
    // no files in root
	const index = path.resolve(tmpDir, "dist", "index.html");
    expect(fs.existsSync(index)).toBeFalsy();
  });


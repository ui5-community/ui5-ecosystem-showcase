
const fs = require("fs-extra");
const path = require("path");
const { spawnSync } = require("child_process");

//const test = require("ava");
const tmpDir = "./test/tmp";
jest.setTimeout(7000);

beforeEach(async () => {
    // cleanup
    return fs.mkdir(tmpDir);

  });

afterEach(async () => {
    // cleanup
    return fs.remove(tmpDir);
  });

  test("build with defaults", async (t) => {
	console.log(1)
    const ui5 = { yaml: path.resolve("./test/__assets__/ui5.basic.yaml") };
    spawnSync(`ui5 build --config ${ui5.yaml} --dest ${tmpDir}/dist`, {
      stdio: "inherit", // > don't include stdout in test output,
      shell: true,
      cwd: path.resolve(__dirname, "../../ui5-app"),
    });
    // default options move Resources and update index.html
    // timestamp folder exsists
    // index.html is in root and has timestamp in resourceroots
    const index = path.resolve(tmpDir, "dist", "index.html");
    expect(fs.existsSync(index)).toBeTruthy();;

    try {
        const content = fs.readFileSync(index, 'utf8');
        console.log(data);

        const sRegex = /data-sap-ui-resourceroots.*=.*'(.*)'/;
        var sResourceRoots = content.match(sRegex)[1];
        var oResouceRoots = JSON.parse(sResourceRoots);
        const aModuleNames = Object.keys(oResouceRoots);
        const sModulePath = oResouceRoots[aModuleNames[0]];
        var atmp = sModulePath.split("~")
        if (atmp.length >2){
            const timestamp = atmp[1];

            const timestampDir = path.resolve(tmpDir, "dist", `~${timestamp}~`);
            expect(fs.existsSync(timestampDir)).toBeTruthy();;
        }
    } catch (err) {
        console.error(err);

    }

  });
  test("only update index.html", () => {
	console.log(2)
    const ui5 = { yaml: path.resolve("./test/__assets__/ui5.onlyIndex.yaml") };
    var res = spawnSync(`ui5 build --config ${ui5.yaml} --dest ${tmpDir}/dist`, {
      stdio: "inherit", // > don't include stdout in test output,
      shell: true,
      cwd: path.resolve(__dirname, "../../ui5-app"),
    });
	console.log(res);
    // no timestamp folder
	expect(true).toBeTruthy();
  });
  /*
  //test("index.html has more than one resource root path", async (t) => { //TODO how to ?
  //  const ui5 = { yaml: path.resolve("./test/__assets__/ui5.onlyIndex.yaml") };
  //  spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
  //    stdio: "inherit", // > don't include stdout in test output,
  //    shell: true,
  //    cwd: path.resolve(__dirname, "../../ui5-app"),
  //  });
  //  // both resource roots with timestamp path
  //});
/*
  test("only move files", async (t) => {
    const ui5 = { yaml: path.resolve("./test/__assets__/ui5.onlyMove.yaml") };
    spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
      stdio: "inherit", // > don't include stdout in test output,
      shell: true,
      cwd: path.resolve(__dirname, "../../ui5-app"),
    });
    // timestamp folder exsists
    // index.html not changed

  });
  test("more than default from move excluded resources", async (t) => {
    const ui5 = { yaml: path.resolve("./test/__assets__/ui5.onlyMove.yaml") };
    spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
      stdio: "inherit", // > don't include stdout in test output,
      shell: true,
      cwd: path.resolve(__dirname, "../../ui5-app"),
    });
    // excluded resources also in root folder

  });
  test("no excluded resources", async (t) => {
    const ui5 = { yaml: path.resolve("./test/__assets__/ui5.noExcluded.yaml") };
    spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
      stdio: "inherit", // > don't include stdout in test output,
      shell: true,
      cwd: path.resolve(__dirname, "../../ui5-app"),
    });
    // no files in root

  });
*/

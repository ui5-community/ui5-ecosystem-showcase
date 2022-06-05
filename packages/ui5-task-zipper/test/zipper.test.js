const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const { spawnSync } = require("child_process");
const yauzl = require("yauzl");

const test = require("ava");

/**
 * check whether a file ("needle") is contained inside the zip
 *
 * @param {string} zip path to a zip file
 * @param {string} needle path/file to find in the zip
 * @returns {Promise<true|false>} true when needle is found in zip, false otherwise
 */
async function promisifiedNeedleInHaystack(zip, needle) {
  return new Promise((resolve, reject) => {
    let additionalFileFound = false;
    yauzl.open(zip, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(err);
      }
      zipfile.readEntry();
      zipfile.on("entry", (entry) => {
        if (entry.fileName.includes(needle)) {
          resolve(true);
        } else {
          zipfile.readEntry();
        }
      });
      zipfile.on("end", () => {
        if (additionalFileFound) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  });
}

test.beforeEach(async (t) => {
  // copy ui5 app to a temp dir in test folder scope
  t.context.tmpDir = path.resolve(
    `./test/_ui5-app/${crypto.randomBytes(5).toString("hex")}`
  );
  //await copyUI5app(t.context.tmpDir);
});

test.afterEach.always(async (t) => {
  // cleanup
  await fs.remove(t.context.tmpDir);
});

test("archive creation w/ defaults", async (t) => {
  const ui5 = { yaml: path.resolve("./test/__assets__/ui5.basic.yaml") };
  spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
    stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: path.resolve(__dirname, "../../ui5-app"),
  });
  // default options packs to $app-id.zip
  const targetZip = path.resolve(t.context.tmpDir, "dist", "testSample.zip");
  t.true(await fs.pathExists(targetZip));
});

test("archive creation with custom archive name", async (t) => {
  const ui5 = {
    yaml: path.resolve("./test/__assets__/ui5.customZipName.yaml"),
  };
  spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
    stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: path.resolve(__dirname, "../../ui5-app"),
  });
  // default options packs to $app-id.zip
  const targetZip = path.resolve(t.context.tmpDir, "dist", "customZipName.zip");
  t.true(await fs.pathExists(targetZip));
});

test("onlyZip only procudes $file.zip + resources folder", async (t) => {
  const ui5 = {
    yaml: path.resolve("./test/__assets__/ui5.onlyZip.yaml"),
  };
  spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
    stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: path.resolve(__dirname, "../../ui5-app"),
  });

  const files = await fs.readdir(path.join(t.context.tmpDir, "dist"));
  t.true(
    files.length > 0 && files.length <= 2,
    `${files.length} in zip: ${files.join(", ")}`
  );
});

test("UI5 lib dependencies are optionally included", async (t) => {
  const ui5 = {
    yaml: path.resolve("./test/__assets__/ui5.includeDeps.yaml"),
  };
  spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
    stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: path.resolve(__dirname, "../../ui5-app"),
  });

  const zip = path.join(t.context.tmpDir, "dist", "testSample.zip");
  // see libraries deps in ui5.includeDepy.yaml
  const allDepsFound = await Promise.all([
    promisifiedNeedleInHaystack(zip, "resources/sap/m/"),
    promisifiedNeedleInHaystack(zip, "resources/sap/ui/core"),
    promisifiedNeedleInHaystack(
      zip,
      "resources/sap/ui/commons/themes/sap_fiori_3"
    ),
  ]);
  t.true(allDepsFound.every((dep) => dep === true));
});

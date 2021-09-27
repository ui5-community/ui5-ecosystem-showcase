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
function promisifiedNeedleInHaystack(zip, needle) {
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

/**
 * copy showcase ui5 app for test purposes
 * and rm included ui5.yaml
 *
 * @param {string} tmpDir path to copy ui5 app (that acts as the test app to)
 */
async function copyUI5app(tmpDir) {
  await fs.mkdir(tmpDir);
  const filterFn = (src, _) => {
    const yo = ["node_modules", "dist", "ui5.yaml"].find((node) =>
      src.endsWith(node)
    );
    return yo === undefined ? true : false;
  };
  try {
    await fs.copy(path.resolve(__dirname, "../../ui5-app"), tmpDir, {
      filter: filterFn,
    });
  } catch (err) {
    ("");
  }
}

test.beforeEach(async (t) => {
  // copy ui5 app to a temp dir in test folder scope
  t.context.tmpDir = path.resolve(
    `./test/_ui5-app/${crypto.randomBytes(5).toString("hex")}`
  );
  await copyUI5app(t.context.tmpDir);
});

test.afterEach.always(async (t) => {
  // cleanup
  //   await fs.remove(t.context.tmpDir);
});

test("archive creation w/ defaults", async (t) => {
  const ui5 = { yaml: path.resolve("./test/__assets__/ui5.basic.yaml") };
  spawnSync(`ui5 build --config ${ui5.yaml}`, {
    // stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: t.context.tmpDir,
  });
  // default options packs to $app-id.zip
  const targetZip = path.resolve(t.context.tmpDir, "dist", "testSample.zip");
  t.true(await fs.pathExists(targetZip));
});

test("archive creation with custom archive name", async (t) => {
  const ui5 = {
    yaml: path.resolve("./test/__assets__/ui5.customZipName.yaml"),
  };
  spawnSync(`ui5 build --config ${ui5.yaml}`, {
    // stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: t.context.tmpDir,
  });
  // default options packs to $app-id.zip
  const targetZip = path.resolve(t.context.tmpDir, "dist", "customZipName.zip");
  t.true(await fs.pathExists(targetZip));
});

test("additional files are included in the zip", async (t) => {
  const ui5 = {
    yaml: path.resolve("./test/__assets__/ui5.additionalFiles.yaml"),
  };
  // create a subdir structure + an (empty) additional file to be included
  const _addtlFile = "some/sub/dir/additional.html";
  const additionalFile = path.resolve(t.context.tmpDir, _addtlFile);
  await fs.ensureFile(additionalFile);
  spawnSync(`ui5 build --config ${ui5.yaml}`, {
    stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: t.context.tmpDir,
  });

  const targetZip = path.resolve(
    t.context.tmpDir,
    "dist",
    "customZipName.zip" // set in ui5.additionalFiles.yaml
  );

  t.true(await promisifiedNeedleInHaystack(targetZip, _addtlFile));
});

test("onlyZip only procudes $file.zip + resources folder", async (t) => {
  const ui5 = {
    yaml: path.resolve("./test/__assets__/ui5.onlyZip.yaml"),
  };
  spawnSync(`ui5 build --config ${ui5.yaml}`, {
    // stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: t.context.tmpDir,
  });

  const files = await fs.readdir(path.join(t.context.tmpDir, "dist"));
  t.true(
    files.length > 0 && files.length <= 2,
    `${files.length} in zip: ${files.join(", ")}`
  );
});
test.todo("include dependencies");

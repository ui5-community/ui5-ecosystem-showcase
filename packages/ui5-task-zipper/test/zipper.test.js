const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const { spawnSync } = require("child_process");

const test = require("ava");

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
test.todo("additional files");
test.todo("onlyZip");
test.todo("include dependencies");

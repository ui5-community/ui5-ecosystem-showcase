const path = require("path");
const { rmSync, existsSync, readdirSync } = require("fs");
const { spawnSync } = require("child_process");
// const crypto = require("crypto");
const yauzl = require("yauzl");

const test = require("ava");

/**
 * check whether a file ("needle") is contained inside the zip
 *
 * @param {string} zip path to a zip file
 * @param {string} needle path/file to find in the zip
 * @param {boolean} readFileContent whether to read the file content
 * @returns {Promise<true|string|false>} true when needle is found in zip, string if file content could be read, false otherwise
 */
async function promisifiedNeedleInHaystack(zip, needle, readFileContent = false) {
  return new Promise((resolve, reject) => {
    let additionalFileFound = false;
    yauzl.open(zip, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(err);
      }
      zipfile.readEntry();
      zipfile.on("entry", (entry) => {

		let fileContent
        if (entry.fileName.includes(needle)) {
		  if (readFileContent) {
			  zipfile.openReadStream(entry, async (err, readStream) => {
				  if (err) {
					  reject(err)
				  }
				  const chunks = []
				  for await (const chunk of readStream) {
					  chunks.push(Buffer.from(chunk));
				  }
				  fileContent = Buffer.concat(chunks).toString("utf-8")
				  resolve(fileContent)
		  	  })
		  } else {
			  resolve(true)
		  }
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
    `./test/__dist__/${crypto.randomBytes(5).toString("hex")}`
  );
});

test.afterEach.always(async (t) => {
  // cleanup
	rmSync(t.context.tmpDir, { recursive: true, force: true });
});

test("archive creation w/ additional directories", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5-app/ui5.additionalDirectories.yaml") };
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-app"),
	});
	// default options packs to $app-id.zip
	const targetZip = path.resolve(t.context.tmpDir, "dist", "customZipName.zip");
	t.true(existsSync(targetZip));
	const allDepsFound = await Promise.all([
		promisifiedNeedleInHaystack(targetZip, "testDir/README.md"),
		promisifiedNeedleInHaystack(targetZip, "testDir/subFolder/testFile.js")
	]);
	t.true(allDepsFound.every((dep) => dep === true));
});

test("archive creation w/ additional files", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5-app/ui5.additionalFiles.yaml") };
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-app"),
	});
	// default options packs to $app-id.zip
	const targetZip = path.resolve(t.context.tmpDir, "dist", "customZipName.zip");
	t.true(existsSync(targetZip));
	const allDepsFound = await Promise.all([
		promisifiedNeedleInHaystack(targetZip, "xs-app.json")
	]);
	t.true(allDepsFound.every((dep) => dep === true));
});
test("archive creation w/ additional files map", async (t) => {
	const ui5 = { yaml: path.resolve("./test/__assets__/ui5-app/ui5.additionalFilesMap.yaml") };
	spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
		stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: path.resolve(__dirname, "../../../showcases/ui5-app"),
	});
	// default options packs to $app-id.zip
	const targetZip = path.resolve(t.context.tmpDir, "dist", "customZipName.zip");
	t.true(existsSync(targetZip));
	const allDepsFound = await Promise.all([
		promisifiedNeedleInHaystack(targetZip, "xs-app.json"),
		promisifiedNeedleInHaystack(targetZip, "package.json"),
		promisifiedNeedleInHaystack(targetZip, "some/custom/dir/firebase.js"),
	]);
	t.true(allDepsFound.every((dep) => dep === true));
});

test("archive creation w/ defaults", async (t) => {
  const ui5 = { yaml: path.resolve("./test/__assets__/ui5-app/ui5.basic.yaml") };
  spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
    stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: path.resolve(__dirname, "../../../showcases/ui5-app"),
  });
  // default options packs to $app-id.zip
  const targetZip = path.resolve(t.context.tmpDir, "dist", "ui5ecosystemdemoapp.zip");
  t.true(existsSync(targetZip));
});

test("archive creation with custom archive name", async (t) => {
  const ui5 = {
    yaml: path.resolve("./test/__assets__/ui5-app/ui5.customZipName.yaml"),
  };
  spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
    stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: path.resolve(__dirname, "../../../showcases/ui5-app"),
  });
  // default options packs to $app-id.zip
  const targetZip = path.resolve(t.context.tmpDir, "dist", "customZipName.zip");
  t.true(existsSync(targetZip));
});

test("onlyZip only produces $file.zip + resources folder", async (t) => {
  const ui5 = {
    yaml: path.resolve("./test/__assets__/ui5-app/ui5.onlyZip.yaml"),
  };
  spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
    stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: path.resolve(__dirname, "../../../showcases/ui5-app"),
  });

  const files = readdirSync(path.join(t.context.tmpDir, "dist"));
  t.true(
    files.length > 0 && files.length <= 2,
    `${files.length} in zip: ${files.join(", ")}`
  );
});

test("UI5 lib dependencies are optionally included", async (t) => {
  const ui5 = {
    yaml: path.resolve("./test/__assets__/ui5-app/ui5.includeDeps.yaml"),
  };
  spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
    stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: path.resolve(__dirname, "../../../showcases/ui5-app"),
  });

  const zip = path.join(t.context.tmpDir, "dist", "ui5ecosystemdemoapp.zip");
  // see libraries deps in ui5.includeDepy.yaml
  const allDepsFound = await Promise.all([
    promisifiedNeedleInHaystack(zip, "resources/sap/m/"),
    promisifiedNeedleInHaystack(zip, "resources/sap/ui/core"),
    promisifiedNeedleInHaystack(
      zip,
      "resources/sap/ui/commons/themes/sap_horizon"
    ),
  ]);
  t.true(allDepsFound.every((dep) => dep === true));
});

test("shims are included", async (t) => {
  const ui5 = {
    yaml: path.resolve("./test/__assets__/ui5-app-simple/ui5.includeShims.yaml"),
  };
  spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
    stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: path.resolve(__dirname, "../../../showcases/ui5-app-simple"),
  });

  const zip = path.join(t.context.tmpDir, "dist", "simpleapp.zip");
  // see libraries deps in ui5.includeDepy.yaml
  const allDepsFound = await Promise.all([
    promisifiedNeedleInHaystack(zip, "shim/rimraf/"),
  ]);
  t.true(allDepsFound.every((dep) => dep === true));
});

test("Some UI5 lib dependencies are included", async (t) => {
  const ui5 = {
    yaml: path.resolve("./test/__assets__/ui5-app-simple/ui5.includeSomeDeps.yaml"),
  };
  spawnSync(`ui5 build --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
    stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: path.resolve(__dirname, "../../../showcases/ui5-app-simple"),
  });

  const zip = path.join(t.context.tmpDir, "dist", "simpleapp.zip");
  // see libraries deps in ui5.includeDepy.yaml
  const allDepsFound = await Promise.allSettled([
    promisifiedNeedleInHaystack(zip, "resources/sap/ui/core"),
    promisifiedNeedleInHaystack(zip, "resources/sap/ui/layout"),
  ]);
  t.false(allDepsFound[0].value);
  t.true(allDepsFound[1].value);
});

test("Standalone App Bundle is included in ZIP in self-contained build", async (t) => {
  const ui5 = {
    yaml: path.resolve("./test/__assets__/ui5-app/ui5.basic.yaml"),
  };
  spawnSync(`ui5 build self-contained --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
    stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: path.resolve(__dirname, "../../../showcases/ui5-app"),
  });

  const zip = path.join(t.context.tmpDir, "dist", "ui5ecosystemdemoapp.zip");

  for (const fileName of [
    "sap-ui-custom.js",
    "sap-ui-custom-dbg.js",
    "sap-ui-custom.js.map",
    "sap-ui-custom-dbg.js.map",
  ]){
    const fileFound = await promisifiedNeedleInHaystack(zip, `resources/${fileName}`);
    t.true(fileFound, `File resources/${fileName} not found in ZIP`);
  }
});

test("Absolute paths for data sources in manifest.json are turned into relative paths", async (t) => {
  const ui5 = {
    yaml: path.resolve("./test/__assets__/ui5-app/ui5.relativePaths.yaml"),
  };
  spawnSync(`ui5 build self-contained --config ${ui5.yaml} --dest ${t.context.tmpDir}/dist`, {
    stdio: "inherit", // > don't include stdout in test output,
    shell: true,
    cwd: path.resolve(__dirname, "../../../showcases/ui5-app"),
  });

  const zip = path.join(t.context.tmpDir, "dist", "ui5ecosystemdemoapp.zip");

  const fileContent = await promisifiedNeedleInHaystack(zip, "manifest.json", true);
  t.regex(fileContent, new RegExp("\"uri\": \"backend/\","), "Manifest.json does not include relative path for the backend data source");

});

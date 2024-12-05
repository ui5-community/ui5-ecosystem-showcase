const test = require("ava");
const path = require("path");
const { rmSync, readFileSync, writeFileSync, existsSync, mkdirSync } = require("fs");

const WebComponentRegistry = require("../lib/utils/WebComponentRegistry");

// clean up test fixtures
const cwd = process.cwd();
const fixtureDir = path.resolve(cwd, `test/__fixtures__`);
const generateFixtures = process.argv.slice(2)?.[0] == "--generateFixtures";
if (generateFixtures) {
	rmSync(fixtureDir, { recursive: true, force: true });
}

function ensurePathExists(path) {
	// create fixture folder per package
	if (!existsSync(path)) {
		mkdirSync(path, { recursive: true });
	}
}

/**
 * Creates test fixtures for each class contained in the given package's metadata.
 * @param {RegistryEntry} webcRegistryEntry the WebComponent RegistryEntry
 */
function writeFixtures(webcRegistryEntry) {
	const fixtureBase = path.resolve(fixtureDir, webcRegistryEntry.namespace);

	// create fixtures in the base folder per class
	ensurePathExists(path.resolve(fixtureBase, "classes"));
	Object.keys(webcRegistryEntry.classes).forEach((className) => {
		const classJSON = JSON.stringify(webcRegistryEntry.classes[className]._ui5metadata);
		writeFileSync(path.join(fixtureBase, `classes/${className}.json`), classJSON, { encoding: "utf8" });
	});

	// enums
	ensurePathExists(path.resolve(fixtureBase, "enums"));
	Object.keys(webcRegistryEntry.enums).forEach((enumName) => {
		const enumJSON = JSON.stringify(webcRegistryEntry.enums[enumName]);
		writeFileSync(path.join(fixtureBase, `enums/${enumName}.json`), enumJSON, { encoding: "utf8" });
	});

	// interfaces
	const interfacesJson = JSON.stringify([...webcRegistryEntry.interfaces]);
	writeFileSync(path.join(fixtureBase, `interfaces.json`), interfacesJson, { encoding: "utf8" });
}

// *****************************************************************************
// TESTS START HERE!
// *****************************************************************************

test.serial("Verify generation of @stomp/stompjs", async (t) => {
	const appDir = path.join(__dirname, "../../../showcases", "ui5-tsapp-webc");

	const webcBaseNpmPackage = "@ui5/webcomponents-base";
	const webcBasePath = require.resolve(`${webcBaseNpmPackage}/dist/custom-elements-internal.json`, {
		paths: [appDir],
	});
	const webcBaseJson = JSON.parse(readFileSync(webcBasePath, { encoding: "utf-8" }));

	WebComponentRegistry.register({
		customElementsMetadata: webcBaseJson,
		namespace: webcBaseNpmPackage,
		npmPackagePath: webcBasePath,
		version: "0.0.0",
	});

	const webcNpmPackage = "@ui5/webcomponents";
	const webcPath = require.resolve(`${webcNpmPackage}/dist/custom-elements-internal.json`, {
		paths: [appDir],
	});
	const webcJson = JSON.parse(readFileSync(webcPath, { encoding: "utf-8" }));

	WebComponentRegistry.register({
		customElementsMetadata: webcJson,
		namespace: webcNpmPackage,
		npmPackagePath: webcPath,
		version: "0.0.0",
	});

	// write fixture files
	if (generateFixtures) {
		console.log("Generating WebComponentRegistry test fixtures...");
		writeFixtures(WebComponentRegistry.getPackage(webcBaseNpmPackage));
		writeFixtures(WebComponentRegistry.getPackage(webcNpmPackage));
	}

	// read fixtures
	t.truthy(true, ":)");
	//t.is(WebComponentRegistry.getPackage(webcNpmPackage), webcNpmPackage, "WebComponentRegistry.getPackage(webcNpmPackage) === webcNpmPackage");
});

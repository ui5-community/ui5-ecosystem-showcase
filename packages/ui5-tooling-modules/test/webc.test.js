const test = require("ava");
const path = require("path");
const { rmSync, readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } = require("fs");

const WebComponentRegistry = require("../lib/utils/WebComponentRegistry");

// clean up test fixtures
const cwd = process.cwd();
const fixtureDir = path.resolve(cwd, `test/__fixtures__`);
const generateFixtures = process.argv.slice(2).indexOf("--generateFixtures") !== -1;
if (generateFixtures) {
	rmSync(fixtureDir, { recursive: true, force: true });
}

/**
 * Ensures that the given path exists. If it does not exist, it creates the directory.
 * @param {string} path the path to check
 */
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
	const interfacesJson = JSON.stringify([...Object.keys(webcRegistryEntry.interfaces)]);
	writeFileSync(path.join(fixtureBase, `interfaces.json`), interfacesJson, { encoding: "utf8" });
}

/**
 * Loads the WebComponent package and registers it in the WebComponentRegistry.
 * @param {string} webcBaseNpmPackage the name of the WebComponent package
 * @param {string} dist the distribution path
 * @param {string} appDir the application directory
 */
function loadWebComponentPackage(webcBaseNpmPackage, dist, appDir) {
	const webcBasePath = require.resolve(`${webcBaseNpmPackage}${dist}/custom-elements-internal.json`, {
		paths: [appDir],
	});
	if (generateFixtures) {
		ensurePathExists(path.resolve(fixtureDir, webcBaseNpmPackage));
		copyFileSync(webcBasePath, path.resolve(fixtureDir, webcBaseNpmPackage, "custom-elements-internal.json"));
	}
	const webcBaseJson = JSON.parse(readFileSync(webcBasePath, { encoding: "utf-8" }));

	WebComponentRegistry.register({
		customElementsMetadata: webcBaseJson,
		namespace: webcBaseNpmPackage,
		npmPackagePath: webcBasePath,
		version: "0.0.0",
	});
}

// *****************************************************************************
// TESTS START HERE!
// *****************************************************************************

test.serial("Verify ui5-metadata generation from 'custom-elements-internal.json'", async (t) => {
	const appDir = path.join(__dirname, generateFixtures ? "../../../showcases" : fixtureDir, "ui5-tsapp-webc");
	const dist = generateFixtures ? "/dist" : "";

	const compareFixtures = (webcRegistryEntry) => {
		const fixtureBase = path.resolve(fixtureDir, webcRegistryEntry.namespace);

		if (!existsSync(path.resolve(fixtureDir, webcRegistryEntry.namespace))) {
			t.truthy(false, `Fixture folder for ${webcRegistryEntry.namespace} does not exist. Please create fixtures first.`);
		}

		// compare fixtures in the base folder per class
		Object.keys(webcRegistryEntry.classes).forEach((className) => {
			const classJSON = JSON.stringify(webcRegistryEntry.classes[className]._ui5metadata);
			const classFixtureForComparisonJSON = readFileSync(path.join(fixtureBase, `classes/${className}.json`), { encoding: "utf-8" });
			t.is(classFixtureForComparisonJSON, classJSON, `Class ${webcRegistryEntry.namespace}.${className} JSON is equal to fixture`);
		});

		// compare enums
		Object.keys(webcRegistryEntry.enums).forEach((enumName) => {
			const enumJSON = JSON.stringify(webcRegistryEntry.enums[enumName]);
			const enumFixtureForComparisonJSON = readFileSync(path.join(fixtureBase, `enums/${enumName}.json`), { encoding: "utf-8" });
			t.is(enumFixtureForComparisonJSON, enumJSON, `Enum ${enumJSON} JSON is equal to fixture`);
		});

		// compare interfaces
		const interfacesJson = JSON.stringify([...Object.keys(webcRegistryEntry.interfaces)]);
		const interfacesFixtureForComparisonJSON = readFileSync(path.join(fixtureBase, `interfaces.json`), { encoding: "utf-8" });
		t.is(interfacesFixtureForComparisonJSON, interfacesJson, `Interfaces JSON is equal to fixture`);
	};

	loadWebComponentPackage("@ui5/webcomponents-base", dist, appDir);
	loadWebComponentPackage("@ui5/webcomponents", dist, appDir);
	loadWebComponentPackage("@ui5/webcomponents-fiori", dist, appDir);
	loadWebComponentPackage("@ui5/webcomponents-ai", dist, appDir);

	// write fixture files
	if (generateFixtures) {
		console.log("Generating WebComponentRegistry test fixtures...");
		writeFixtures(WebComponentRegistry.getPackage("@ui5/webcomponents-base"));
		writeFixtures(WebComponentRegistry.getPackage("@ui5/webcomponents"));
		writeFixtures(WebComponentRegistry.getPackage("@ui5/webcomponents-fiori"));
		writeFixtures(WebComponentRegistry.getPackage("@ui5/webcomponents-ai"));
	}

	// compare with fixture files
	compareFixtures(WebComponentRegistry.getPackage("@ui5/webcomponents-base"));
	compareFixtures(WebComponentRegistry.getPackage("@ui5/webcomponents"));
	compareFixtures(WebComponentRegistry.getPackage("@ui5/webcomponents-fiori"));
	compareFixtures(WebComponentRegistry.getPackage("@ui5/webcomponents-ai"));
});

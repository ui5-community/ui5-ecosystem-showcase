const test = require("ava");
const path = require("path");
const { rmSync, readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } = require("fs");

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
		const interfacesJson = JSON.stringify([...webcRegistryEntry.interfaces]);
		const interfacesFixtureForComparisonJSON = readFileSync(path.join(fixtureBase, `interfaces.json`), { encoding: "utf-8" });
		t.is(interfacesFixtureForComparisonJSON, interfacesJson, `Interfaces JSON is equal to fixture`);
	};

	const webcBaseNpmPackage = "@ui5/webcomponents-base";
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

	const webcNpmPackage = "@ui5/webcomponents";
	const webcPath = require.resolve(`${webcNpmPackage}${dist}/custom-elements-internal.json`, {
		paths: [appDir],
	});
	if (generateFixtures) {
		ensurePathExists(path.resolve(fixtureDir, webcNpmPackage));
		copyFileSync(webcBasePath, path.resolve(fixtureDir, webcNpmPackage, "custom-elements-internal.json"));
	}
	const webcJson = JSON.parse(readFileSync(webcPath, { encoding: "utf-8" }));

	WebComponentRegistry.register({
		customElementsMetadata: webcJson,
		namespace: webcNpmPackage,
		npmPackagePath: webcPath,
		version: "0.0.0",
	});

	const webcFioriNpmPackage = "@ui5/webcomponents-fiori";
	const webcFioriPath = require.resolve(`${webcFioriNpmPackage}${dist}/custom-elements-internal.json`, {
		paths: [appDir],
	});
	if (generateFixtures) {
		ensurePathExists(path.resolve(fixtureDir, webcFioriNpmPackage));
		copyFileSync(webcBasePath, path.resolve(fixtureDir, webcFioriNpmPackage, "custom-elements-internal.json"));
	}
	const webcFioriJson = JSON.parse(readFileSync(webcFioriPath, { encoding: "utf-8" }));

	WebComponentRegistry.register({
		customElementsMetadata: webcFioriJson,
		namespace: webcFioriNpmPackage,
		npmPackagePath: webcFioriPath,
		version: "0.0.0",
	});

	const webcAiNpmPackage = "@ui5/webcomponents-ai";
	const webcAiPath = require.resolve(`${webcAiNpmPackage}${dist}/custom-elements-internal.json`, {
		paths: [appDir],
	});
	if (generateFixtures) {
		ensurePathExists(path.resolve(fixtureDir, webcAiNpmPackage));
		copyFileSync(webcBasePath, path.resolve(fixtureDir, webcAiNpmPackage, "custom-elements-internal.json"));
	}
	const webcAiJson = JSON.parse(readFileSync(webcAiPath, { encoding: "utf-8" }));

	WebComponentRegistry.register({
		customElementsMetadata: webcAiJson,
		namespace: webcAiNpmPackage,
		npmPackagePath: webcAiPath,
		version: "0.0.0",
	});

	// write fixture files
	if (generateFixtures) {
		console.log("Generating WebComponentRegistry test fixtures...");
		writeFixtures(WebComponentRegistry.getPackage(webcBaseNpmPackage));
		writeFixtures(WebComponentRegistry.getPackage(webcNpmPackage));
		writeFixtures(WebComponentRegistry.getPackage(webcFioriNpmPackage));
		writeFixtures(WebComponentRegistry.getPackage(webcAiNpmPackage));
	}

	// compare with fixture files
	compareFixtures(WebComponentRegistry.getPackage(webcBaseNpmPackage));
	compareFixtures(WebComponentRegistry.getPackage(webcNpmPackage));
	compareFixtures(WebComponentRegistry.getPackage(webcFioriNpmPackage));
	compareFixtures(WebComponentRegistry.getPackage(webcAiNpmPackage));
});

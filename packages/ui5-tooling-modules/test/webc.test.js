const test = require("ava");
const path = require("path");
const { readFileSync } = require("fs");

const WebComponentRegistry = require("../lib/utils/WebComponentRegistry");

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

	console.log("WebComponentRegistry", WebComponentRegistry.getPackage(webcNpmPackage));

	t.equal(WebComponentRegistry.getPackage(webcNpmPackage), webcNpmPackage, "WebComponentRegistry.getPackage(webcNpmPackage) === webcNpmPackage");
});

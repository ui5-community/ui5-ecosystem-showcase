/* @sapUiRequire */

// https://api.qunitjs.com/config/autostart/
QUnit.config.autostart = false;

// as a preparation for UI5 2.x, we need to wait for the Core to be booted
void import("sap/ui/core/Core").then(async ({ default: Core }) => {
	// wait for the Core to be booted
	await Core.ready();

	// import all your QUnit tests here
	void Promise.all([import("unit/controller/App.qunit")]).then(() => {
		QUnit.start();
	});
});

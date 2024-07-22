/* @sapUiRequire */

// https://api.qunitjs.com/config/autostart/
QUnit.config.autostart = false;

// import all your QUnit tests here
void Promise.all([import("ui5/ecosystem/demo/tsapp/test/integration/HelloJourney")]).then(() => {
	QUnit.start();
});

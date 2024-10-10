/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["sap/ui/core/Core"], function (Core) {
	Core.ready().then(function () {
		sap.ui.require(["ui5/ecosystem/demo/app/test/unit/AllTests"], function () {
			QUnit.start();
		});
	});
});

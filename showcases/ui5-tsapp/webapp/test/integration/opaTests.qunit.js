sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require(["ui5/ecosystem/demo/tsapp/test/integration/HelloJourney"], function () {
		QUnit.start();
	});
});

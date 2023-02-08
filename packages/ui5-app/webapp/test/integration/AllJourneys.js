sap.ui.define(["sap/ui/test/Opa5", "./arrangements/Startup", "./NavigationJourney", "./BindingJourney", "./InteractionJourney"], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "ui5.ecosystem.demo.app.view.",
		autoWait: true,
	});
});

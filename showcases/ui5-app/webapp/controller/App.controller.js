sap.ui.define(["ui5/ecosystem/demo/app/controller/BaseController"], (Controller) => {
	"use strict";

	return Controller.extend("ui5.ecosystem.demo.app.controller.App", {
		onInit() {
			console.log("Statement will be removed if transpile task is configured accordingly.");

			// Build file will have baseUrl as localhost:2000
			// replaced from ui5.yaml file with UI5 task ui5-tooling-stringreplace-task
			var baseUrl = "BASE_URL_PLACEHOLDER";
			var randomTextToReplace = "some.deeply.nested.ANOTHER_PLACEHOLDER";
			var version = "${project.version}";
			console.log(baseUrl, randomTextToReplace, version);
		},
	});
});

sap.ui.define([
	"test/Sample/controller/BaseController"
], Controller => {
	"use strict";

	return Controller.extend("test.Sample.controller.App", {
		onInit() {
			console.log("Statement will be removed if transpile task is configured accordingly.")

			// Build file will have baseUrl as localhost:2000
			// replaced from ui5.yaml file with UI5 task ui5-task-stringreplacer
			var baseUrl = "BASE_URL_PLACEHOLDER";
			var randomTextToReplace = "some.deeply.nested.ANOTHER_PLACEHOLDER";
		}
	});
});

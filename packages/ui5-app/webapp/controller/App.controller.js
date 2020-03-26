sap.ui.define([
	"test/Sample/controller/BaseController"
], Controller => {
	"use strict";

	return Controller.extend("test.Sample.controller.App", {
		onInit() {
			console.log("Statement will be removed if transpile task is configured accordingly.")
		}
	});
});

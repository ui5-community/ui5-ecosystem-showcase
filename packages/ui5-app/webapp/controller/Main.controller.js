sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("test.Sample.controller.Main", {
		onInit: () => {
			let text = "Hello World";
			console.error(`Peter says: ${text} `);
		}
	});
});
sap.ui.define(["ui5/ecosystem/demo/simpleapp/controller/BaseController", "sap/m/MessageToast"], (Controller, MessageToast) => {
	"use strict";

	return Controller.extend("ui5.ecosystem.demo.simpleapp.controller.Main", {
		onBoo() {
			// next line should be removed!
			console.log(`👻`);
			MessageToast.show(`👻`);
		},
	});
});

sap.ui.define(["ui5/ecosystem/demo/cascaded/app/controller/BaseController", "sap/m/MessageToast"], (Controller, MessageToast) => {
	"use strict";

	return Controller.extend("ui5.ecosystem.demo.cascaded.app.controller.Main", {
		onPress() {
			const value = this.byId("input").getValue();
			MessageToast.show(value ? `You typed: ${value}` : `Button pressed!`);
		},
	});
});

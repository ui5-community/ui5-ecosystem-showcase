sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => {
	"use strict";

	return Controller.extend("ui5.ecosystem.demo.simpleapp.controller.BaseController", {
		getRouter() {
			return this.getOwnerComponent().getRouter();
		},
		getModel(sName) {
			return this.getView().getModel(sName);
		},
		getResourceBundle() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		onNavBack() {
			this.getRouter().navTo("Main", {}, true);
		},
	});
});

sap.ui.define(["test/Sample/controller/BaseController", "sap/m/MessageToast"], (Controller, MessageToast) => {
	"use strict";

	return Controller.extend("test.Sample.controller.Main", {
		// (live) transpiling async functions to ES5 generators not yet doable in ui5-tooling ecosys :)
		/* async */ onInit() {
			sap.ui.getVersionInfo({ async: true }).then((versionInfo) => {
				const versionInfoModel = this.getModel("UI5VersionInfo");
				versionInfoModel.setProperty(
					"/current",
					versionInfo.libraries.find((lib) => lib.name === "sap.ui.core")
				);
			});

			fetch("docs/index.md")
				.then((response) => response.text())
				.then((content) => {
					this.byId("doc").setValue(content);
				})
				.catch((err) => console.error(err));

			fetch("/proxy/local/hello.txt")
				.then((response) => response.text())
				.then((content) => {
					console.log(content);
				})
				.catch((err) => console.error(err));
		},

		navFwd() {
			return this.getOwnerComponent().getRouter().navTo("RouteOther");
		},
		navTest3rd() {
			return this.getOwnerComponent().getRouter().navTo("RouteThirdparty");
		},

		onPress(oEvent) {
			MessageToast.show(`${oEvent.getSource().getId()} pressed`);
		},
		onBoo() {
			MessageToast.show(`👻`);
		},
	});
});

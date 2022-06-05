sap.ui.define(["test/Sample/controller/BaseController", "sap/m/MessageToast"], (Controller, MessageToast) => {
	"use strict";

	return Controller.extend("test.Sample.controller.Main", {
		// (live) transpiling async functions to ES5 generators not yet doable in ui5-tooling ecosys :)
		/* async */ onInit() {
			// let response;
			// let oLatestUI5 = {
			//     version: "n/a"
			// };
			// try {
			//     response = await fetch('/proxy/api/v1/latest?format=json');
			//     oLatestUI5 = await response.json();
			// } catch (err) {
			//     console.error(err)
			// }
			// this.getModel('LatestUI5').setProperty("/latest", latestU5version.version)

			fetch("/proxy/api/v1/latest?format=json")
				.then((response) => response.json())
				.then((latestU5version) => {
					const latestUI5Model = this.getModel("LatestUI5");
					latestUI5Model.setProperty("/latest", latestU5version.version);
					latestUI5Model.setProperty("/type", latestU5version.type);
				})
				.catch((err) => console.error(err));

			fetch("docs/index.md")
				.then((response) => response.text())
				.then((content) => {
					this.byId("doc").setValue(content);
				})
				.catch((err) => console.error(err));
		},

		navFwd() {
			return this.getOwnerComponent().getRouter().navTo("RouteOther");
		},

		onPress(oEvent) {
			MessageToast.show(`${oEvent.getSource().getId()} pressed`);
		},
		onBoo() {
			MessageToast.show(`👻`);
		},
	});
});

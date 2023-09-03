sap.ui.define(["ui5/ecosystem/demo/app/controller/BaseController", "sap/ui/util/openWindow"], (Controller, openWindow) => {
	"use strict";

	return Controller.extend("ui5.ecosystem.demo.app.controller.ODataV4", {
		onInit() {},
		handlePeopleClick(event) {
			const bindingContext = event.getSource().getBindingContext("ODataV4"),
				serviceUrl = bindingContext.getModel().getServiceUrl(),
				sanitizedServiceUrl = /^(.*)\/$/.exec(serviceUrl)?.[1] || serviceUrl,
				path = bindingContext.getPath(),
				href = new URL(sanitizedServiceUrl + path, location.href).toString();
			openWindow(href, "_blank");
		},
	});
});

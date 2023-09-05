sap.ui.define(["ui5/ecosystem/demo/app/controller/BaseController", "sap/ui/util/openWindow"], (Controller, openWindow) => {
	"use strict";

	return Controller.extend("ui5.ecosystem.demo.app.controller.ODataV2", {
		onInit() {},
		handleEmployeeClick(event) {
			const bindingContext = event.getSource().getBindingContext("ODataV2"),
				serviceUrl = bindingContext.getModel().getServiceUrl(),
				sanitizedServiceUrl = /^(.*)\/$/.exec(serviceUrl)?.[1] || serviceUrl,
				path = bindingContext.getPath(),
				href = new URL(sanitizedServiceUrl + path, location.href).toString();
			openWindow(href, "_blank");
		},
	});
});

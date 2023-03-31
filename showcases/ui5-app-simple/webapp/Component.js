sap.ui.define(
	[
		"sap/ui/core/UIComponent",
		"sap/ui/Device",
		"./model/models",
		"sap/ui/core/ComponentSupport", // make sure to include the ComponentSupport in the bundle
	],
	(UIComponent, Device, models) => {
		"use strict";

		return UIComponent.extend("ui5.ecosystem.demo.simpleapp.Component", {
			metadata: {
				manifest: "json",
			},

			init() {
				// call the base component's init function
				UIComponent.prototype.init.apply(this, arguments);

				// enable routing
				this.getRouter().initialize();

				// set the device model
				this.setModel(models.createDeviceModel(), "device");
			},
		});
	}
);

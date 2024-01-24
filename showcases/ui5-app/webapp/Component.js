sap.ui.define(
	[
		"sap/ui/core/UIComponent",
		"ui5/ecosystem/demo/app/model/models",
		"./lib/willNotGetTranspiled", // only for demo purpose
		"./includes/iWillBeTranspiled", // only for demo purpose
		"sap/ui/core/ComponentSupport", // make sure to include the ComponentSupport in the bundle
		"./webc/WebComponentSupport", // support WebComponents natively in XMLViews
	],
	(UIComponent, models) => {
		"use strict";

		return UIComponent.extend("ui5.ecosystem.demo.app.Component", {
			metadata: {
				manifest: "json",
			},

			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
			 *
			 * @public
			 * @override
			 */
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

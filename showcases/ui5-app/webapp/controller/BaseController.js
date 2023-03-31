sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => {
	"use strict";

	return Controller.extend("ui5.ecosystem.demo.app.controller.BaseController", {
		/**
		 * inits on controller instantiation
		 */
		onInit() {},

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 *
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter() {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 *
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 *
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 *
		 * @public
		 */
		onNavBack() {
			this.getRouter().navTo("RouteMain", {}, true);
		},
	});
});

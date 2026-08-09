sap.ui.define(["sap/ui/core/mvc/View", "sap/m/Page", "sap/m/VBox", "sap/m/Title", "sap/m/Text", "sap/m/Button"], function (View, Page, VBox, Title, Text, Button) {
	"use strict";

	// Typed View (the modern, non-deprecated JS view): the view IS this module and is
	// addressed in the manifest via "module:ui5/ecosystem/demo/app/view/Typed.view".
	//
	// HMR showcase: edit any of the strings below (or add/remove controls) and save — the
	// ui5-middleware-hmr middleware re-instantiates this view in place, no full page reload.
	return View.extend("ui5.ecosystem.demo.app.view.Typed", {
		getControllerName: function () {
			// reuse the BaseController just for the onNavBack handler
			return "ui5.ecosystem.demo.app.controller.BaseController";
		},

		createContent: function (oController) {
			return new Page({
				title: "Typed View (JS)",
				showNavButton: true,
				navButtonPress: [oController.onNavBack, oController],
				content: [
					new VBox({
						alignItems: "Center",
						justifyContent: "Center",
						height: "100%",
						items: [
							new Title({ level: "H1", text: "👋 Hello from a Typed View" }),
							// ↓ edit this text and save to see HMR re-instantiate the view
							new Text({ text: "Edit me in view/Typed.view.js and hit save — HMR swaps me in place." }),
							new Button({ text: "Back to Main", icon: "sap-icon://nav-back", press: [oController.onNavBack, oController] }),
						],
					}),
				],
			});
		},
	});
});

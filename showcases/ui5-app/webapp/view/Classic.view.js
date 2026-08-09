sap.ui.define(["sap/ui/core/mvc/JSView", "sap/m/Page", "sap/m/VBox", "sap/m/Title", "sap/m/Text", "sap/m/Button"], function (JSView, Page, VBox, Title, Text, Button) {
	"use strict";

	// Classic JSView (the deprecated JS view flavour): declared via sap.ui.jsview(...) and
	// referenced in the manifest with "viewType": "JS" + "viewName": "Classic".
	//
	// HMR showcase: edit any of the strings below (or add/remove controls) and save — the
	// ui5-middleware-hmr middleware re-instantiates this view in place, no full page reload.
	return sap.ui.jsview("ui5.ecosystem.demo.app.view.Classic", {
		getControllerName: function () {
			// reuse the BaseController just for the onNavBack handler
			return "ui5.ecosystem.demo.app.controller.BaseController";
		},

		createContent: function (oController) {
			return new Page({
				title: "Classic JSView",
				showNavButton: true,
				navButtonPress: [oController.onNavBack, oController],
				content: [
					new VBox({
						alignItems: "Center",
						justifyContent: "Center",
						height: "100%",
						items: [
							new Title({ level: "H1", text: "👋 Hello from a classic JSView" }),
							// ↓ edit this text and save to see HMR re-instantiate the view
							new Text({ text: "Edit me in view/Classic.view.js and hit save — HMR swaps me in place." }),
							new Button({ text: "Back to Main", icon: "sap-icon://nav-back", press: [oController.onNavBack, oController] }),
						],
					}),
				],
			});
		},
	});
});

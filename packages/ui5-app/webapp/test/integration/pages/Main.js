sap.ui.define(["sap/ui/test/Opa5", "sap/ui/test/actions/Press"], function (Opa5, Press) {
	"use strict";
	var sViewName = "Main";

	Opa5.createPageObjects({
		onTheAppPage: {
			actions: {
				iPressTheNavButton: function () {
					return this.waitFor({
						viewName: sViewName,
						id: "NavButton",
						actions: new Press(),
					});
				},
			},

			assertions: {
				iShouldSeeTheApp: function () {
					return this.waitFor({
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "The Main view is displayed");
						},
						errorMessage: "Did not find the Main view",
					});
				},
				iShouldSeeTheNavButton: function () {
					return this.waitFor({
						viewName: sViewName,
						id: "NavButton",
						success: function () {
							Opa5.assert.ok(true, "The Main view contains the nav button!");
						},
						errorMessage: "Did not find the nav button on the Main view!",
					});
				},
			},
		},
	});
});

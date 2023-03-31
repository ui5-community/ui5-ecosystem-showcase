sap.ui.define(
	["sap/ui/test/Opa5", "sap/ui/test/matchers/AggregationLengthEquals", "sap/ui/test/matchers/AggregationFilled", "sap/ui/test/actions/Press"],
	function (Opa5, AggregationLengthEquals, AggregationFilled, Press) {
		"use strict";
		var sViewName = "Other";

		Opa5.createPageObjects({
			onTheOtherView: {
				actions: {
					iNavigateBack: function () {
						return this.waitFor({
							viewName: sViewName,
							id: /-navButton/,
							actions: new Press(),
							success: function () {
								Opa5.assert.ok(true, "nav back via sap.m.Page's nav back button!");
							},
							errorMessage: "couldn't locate or use the sap.m.Page's nav back button",
						});
					},
				},

				assertions: {
					iShouldSeeTheList: function () {
						return this.waitFor({
							viewName: sViewName,
							success: function () {
								Opa5.assert.ok(true, "The Other view is displayed");
							},
							errorMessage: "Did not find the Other view",
						});
					},

					theListShouldBeBound: function () {
						return this.waitFor({
							viewName: sViewName,
							id: "PeopleList",
							matchers: [
								new AggregationFilled({
									name: "items",
								}),
							],
							success: function () {
								Opa5.assert.ok(true, "list is bound");
							},
							errorMessage: "list is not bound!",
						});
					},

					theListContainsAtLeastItems: function (iNumberOfItems) {
						return this.waitFor({
							viewName: sViewName,
							id: "PeopleList",
							matchers: [
								new AggregationLengthEquals({
									name: "items",
									length: 20, // SHOULD be iNumberOfItems,
								}),
							],
							success: function () {
								Opa5.assert.ok(true, "list contains at least " + iNumberOfItems + " items");
							},
						});
					},
				},
			},
		});
	}
);

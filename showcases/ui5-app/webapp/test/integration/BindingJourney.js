/*global QUnit*/

sap.ui.define(["sap/ui/test/opaQunit", "./pages/Main", "./pages/Other"], function (opaTest) {
	"use strict";

	QUnit.module("Binding Journey");

	QUnit.module("Other view: PeopleList: items aggregation");

	opaTest("bound status", function (Given, When, Then) {
		Given.iStartMyApp();

		When.onTheAppPage.iPressTheNavButton();

		Then.onTheOtherView.iShouldSeeTheList().and.theListShouldBeBound();
	});

	opaTest("amount of items", function (Given, When, Then) {
		Then.onTheOtherView
			.theListContainsAtLeastItems(2)

			.and.iTeardownMyApp();
	});
});

/*global QUnit*/

sap.ui.define(["sap/ui/test/opaQunit", "./pages/Main", "./pages/Other"], function (opaTest) {
    "use strict";

    QUnit.module("Navigation Journey");

    opaTest("Should see the initial page of the app", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyApp();

        // Assertions
        Then.onTheAppPage.iShouldSeeTheApp();

        // not really reliable: Then.iTeardownMyApp();
    });

    opaTest("should navigate to the list page and back", function (Given, When, Then) {
        // not really reliable: Given.iStartMyApp();

        When.onTheAppPage.iPressTheNavButton();

        Then.onTheOtherView.iShouldSeeTheList();

		When.onTheOtherView.iNavigateBack();

        Then.onTheAppPage
            .iShouldSeeTheNavButton()

		// Cleanup
            .and.iTeardownMyApp();
    });
});

sap.ui.define(["sap/ui/test/opaQunit", "./pages/Main"], function () {
	QUnit.module("Hello");

	opaTest("Should open the Hello dialog", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "ui5.ecosystem.demo.tsapp",
			},
		});

		//Actions
		When.onTheMainPage.iPressTheSayHelloButton();

		// Assertions
		Then.onTheMainPage.iShouldSeeTheHelloDialog();

		//Actions
		When.onTheMainPage.iPressTheOkButtonInTheDialog();

		// Assertions
		Then.onTheMainPage.iShouldNotSeeTheHelloDialog();

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("Should close the Hello dialog", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "ui5.ecosystem.demo.tsapp",
			},
		});

		//Actions
		When.onTheMainPage.iPressTheSayHelloButton().and.iPressTheOkButtonInTheDialog();

		// Assertions
		Then.onTheMainPage.iShouldNotSeeTheHelloDialog();

		// Cleanup
		Then.iTeardownMyApp();
	});
});

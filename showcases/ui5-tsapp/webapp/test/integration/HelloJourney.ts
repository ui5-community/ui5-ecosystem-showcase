import opaTest from "sap/ui/test/opaQunit";
import MainPage from "./pages/Main";

const onTheMainPage = new MainPage();

QUnit.module("Hello");

opaTest("Should open the Hello dialog", function () {
	// Arrangements
	onTheMainPage.iStartMyUIComponent({
		componentConfig: {
			name: "ui5.ecosystem.demo.tsapp",
		},
	});

	// Actions
	onTheMainPage.iPressTheSayHelloButton();

	// Assertions
	onTheMainPage.iShouldSeeTheHelloDialog();

	// Actions
	onTheMainPage.iPressTheOkButtonInTheDialog();

	// Assertions
	onTheMainPage.iShouldNotSeeTheHelloDialog();

	// Cleanup
	onTheMainPage.iTeardownMyApp();
});

opaTest("Should close the Hello dialog", function (Given, When, Then) {
	// Arrangements
	onTheMainPage.iStartMyUIComponent({
		componentConfig: {
			name: "ui5.ecosystem.demo.tsapp",
		},
	});

	// Actions
	onTheMainPage.iPressTheSayHelloButton().and.iPressTheOkButtonInTheDialog();

	// Assertions
	onTheMainPage.iShouldNotSeeTheHelloDialog();

	// Cleanup
	onTheMainPage.iTeardownMyApp();
});

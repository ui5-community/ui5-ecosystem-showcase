import opaTest from "sap/ui/test/opaQunit";
import MainPage from "./pages/Main";

const onTheMainPage = new MainPage();

QUnit.module("Hello");

opaTest("Should open the Hello dialog", function () {
	// Arrangements
	void onTheMainPage.iStartMyUIComponent({
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
	void onTheMainPage.iTeardownMyApp();
});

opaTest("Should close the Hello dialog", function () {
	// Arrangements
	void onTheMainPage.iStartMyUIComponent({
		componentConfig: {
			name: "ui5.ecosystem.demo.tsapp",
		},
	});

	// Actions
	onTheMainPage.iPressTheSayHelloButton().and.iPressTheOkButtonInTheDialog();

	// Assertions
	onTheMainPage.iShouldNotSeeTheHelloDialog();

	// Cleanup
	void onTheMainPage.iTeardownMyApp();
});

const MainPage = require("./pages/Main");
const onTheOtherPage = require("./pages/Other");

// this suite implemented w/ page object pattern
describe("navigation", function () {
	it("should see the initial page of the app", async function () {
		await MainPage.open();
		expect(MainPage.iShouldSeeTheApp()).toBeTruthy();
	});

	it("should navigate to the list page and back", async function () {
		await MainPage.iPressTheNavButton();

		expect(await onTheOtherPage.iShouldSeeTheList()).toBeTruthy();

		await onTheOtherPage.iNavigateBack();

		expect(MainPage.iShouldSeeTheApp()).toBeTruthy();

		expect(await MainPage.iShouldSeeTheNavButton()).toBeTruthy();
	});
});

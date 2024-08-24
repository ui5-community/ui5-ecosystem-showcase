const MainPage = require("./pages/Main");
const onTheOtherPage = require("./pages/Other");

describe("binding", function () {
	it("should see the initial page of the app", async function () {
		await MainPage.open();
		expect(MainPage.iShouldSeeTheApp()).toBeTruthy();
	});

	it("Other view: PeopleList: items aggregation + amount of items", async function () {
		await MainPage.iPressTheNavButton();
		expect(onTheOtherPage.iShouldSeeListItems()).toBeTruthy();
	});
});

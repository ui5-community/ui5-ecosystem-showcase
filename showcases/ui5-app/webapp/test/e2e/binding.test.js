const MainPage = require("./pages/Main");
const onTheOtherPage = require("./pages/Other");

const list = {
	selector: {
		viewName: "ui5.ecosystem.demo.app.view.Other",
		id: "PeopleList",
	},
};

// this suite implemented straigh-fwd, no page objects
describe("binding", function () {
	it("should see the initial page of the app", async function () {
		await MainPage.open();
		expect(MainPage.iShouldSeeTheApp()).toBeTruthy();
	});

	it("Other view: PeopleList: items aggregation + amount of items", async function () {
		await MainPage.iPressTheNavButton();
		expect(onTheOtherPage.iShouldSeeTheList()).toBeTruthy();
		expect(onTheOtherPage.iShouldSeeListItems()).toBeTruthy();

		// ui5 api + high-speed aggregation retrieval: https://ui5-community.github.io/wdi5/#/usage?id=getshorthand-conveniences
		const aListItems = await browser.asControl(list).getItems(true);
		expect(aListItems.length).toBeGreaterThanOrEqual(1);
	});
});

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

		const oList = await browser.asControl(list);
		console.log("LIST", oList);
		const aListItems = await oList.getItems(true); // ui5 api + high-speed aggregation retrieval: https://ui5-community.github.io/wdi5/#/usage?id=getshorthand-conveniences
		expect(aListItems.length).toBeGreaterThanOrEqual(1);
	});
});

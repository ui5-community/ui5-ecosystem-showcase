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

		console.log(
			"list",
			await browser.asControl({
				selector: {
					viewName: "ui5.ecosystem.demo.app.view.Other",
					id: "PeopleList",
				},
			})
		);

		const isVisible =
			(await browser
				.asControl({
					selector: {
						viewName: "ui5.ecosystem.demo.app.view.Other",
						id: "PeopleList",
					},
				})
				.getVisible()) === true;
		expect(isVisible).toBeTruthy();

		console.log("list2", await browser.asControl(list));

		// ui5 api + high-speed aggregation retrieval: https://ui5-community.github.io/wdi5/#/usage?id=getshorthand-conveniences
		const aListItems = await browser.asControl(list).getItems(true);
		//expect(aListItems.length).toBeGreaterThanOrEqual(1);
	});
});

const onTheOtherPage = require("./pages/Other");

const navFwdButton = {
	forceSelect: true,
	selector: {
		viewName: "ui5.ecosystem.demo.app.view.Main",
		id: "NavButton",
	},
};

const list = {
	selector: {
		viewName: "ui5.ecosystem.demo.app.view.Other",
		id: "PeopleList",
	},
};

// this suite implemented straigh-fwd, no page objects
describe("binding", function () {
	it("Other view: PeopleList: items aggregation + amount of items", async function () {
		await browser.asControl(navFwdButton).press();
		expect(onTheOtherPage.iShouldSeeTheList()).toBeTruthy();

		const oList = await browser.asControl(list);
		console.log("LIST", oList);
		const aListItems = await oList.getItems(true); // ui5 api + high-speed aggregation retrieval: https://ui5-community.github.io/wdi5/#/usage?id=getshorthand-conveniences
		expect(aListItems.length).toBeGreaterThanOrEqual(1);
	});
});

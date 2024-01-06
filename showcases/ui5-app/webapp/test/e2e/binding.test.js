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

		const oList = await browser.asControl(list);
		const aListItems = await oList.getItems(true); // ui5 api + high-speed aggregation retrieval https://github.com/js-soft/wdi5#getshorthand-conveniences
		expect(aListItems.length).toBeGreaterThanOrEqual(1);
	});
});

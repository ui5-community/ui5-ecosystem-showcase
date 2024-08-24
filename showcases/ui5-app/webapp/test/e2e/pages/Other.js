const Page = require("./Page");

class Other extends Page {
	_viewName = "ui5.ecosystem.demo.app.view.Other";

	_listPeople = {
		selector: {
			viewName: "ui5.ecosystem.demo.app.view.Other",
			id: "PeopleList",
		},
	};

	async iShouldSeeTheList() {
		return (await browser.asControl(this._listPeople).getVisible()) === true;
	}

	async iShouldSeeListItems() {
		// ui5 api + high-speed aggregation retrieval: https://ui5-community.github.io/wdi5/#/usage?id=getshorthand-conveniences
		return (await browser.asControl(this._listPeople).getItems()).length > 0;
	}

	async iNavigateBack() {
		await browser
			.asControl({
				selector: {
					id: /.*navButton$/,
				},
			})
			.press();
	}
}

module.exports = new Other();

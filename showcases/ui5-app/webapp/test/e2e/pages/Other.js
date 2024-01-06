const Page = require("./Page");

class Other extends Page {
	_viewName = "ui5.ecosystem.demo.app.view.Other";

	async iShouldSeeTheList() {
		return (
			(await browser
				.asControl({
					selector: {
						viewName: "ui5.ecosystem.demo.app.view.Other",
						id: "PeopleList",
					},
				})
				.getVisible()) === true
		);
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

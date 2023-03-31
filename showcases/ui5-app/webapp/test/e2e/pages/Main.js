const Page = require("./Page");

class Main extends Page {
	async open() {
		await super.open("#/");
	}

	_viewName = "ui5.ecosystem.demo.app.view.Main";

	_navFwdButton = {
		forceSelect: true,
		selector: {
			viewName: "ui5.ecosystem.demo.app.view.Main",
			id: "NavButton",
		},
	};

	async iShouldSeeTheApp() {
		return (
			(await browser
				.asControl({
					forceSelect: true,
					selector: {
						viewName: this._viewName,
						controlType: "sap.m.Title",
						properties: {
							text: "#UI5 demo",
						},
					},
				})
				.getText()) === "#UI5 demo"
		);
	}

	async iPressTheNavButton() {
		await browser.asControl(this._navFwdButton).firePress();
	}

	async iShouldSeeTheNavButton() {
		return (await browser.asControl(this._navFwdButton).getText()) === "to Other view";
	}
}

module.exports = new Main();

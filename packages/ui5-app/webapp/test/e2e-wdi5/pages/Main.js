const Page = require("./Page")

class Main extends Page {
    open() {
        super.open("#/")
    }

    _viewName = "test.Sample.view.Main"

    _navFwdButton = {
        forceSelect: true,
        selector: {
            viewName: "test.Sample.view.Main",
            id: "NavButton"
        }
    }

    iShouldSeeTheApp() {
        return (
            browser
                .asControl({
                    forceSelect: true,
                    selector: {
                        viewName: this._viewName,
                        controlType: "sap.m.Title",
                        properties: {
                            text: "#UI5 demo"
                        }
                    }
                })
                .getText() === "#UI5 demo"
        )
    }

    iPressTheNavButton() {
        browser.asControl(this._navFwdButton).firePress()
    }

    iShouldSeeTheNavButton() {
        return browser.asControl(this._navFwdButton).getText() === "to Other view"
    }
}

module.exports = new Main()

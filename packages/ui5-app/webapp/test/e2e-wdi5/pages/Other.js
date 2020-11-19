const Page = require("./Page")

class Other extends Page {
    _viewName = "test.Sample.view.Other"

    iShouldSeeTheList() {
        return browser.asControl({
            selector: {
                viewName: "test.Sample.view.Other",
                id: "PeopleList"
            }
        }).getVisible() === true
    }

    iNavigateBack() {
        browser.asControl({
            selector: {
                id: /.*navButton$/
            }
        }).firePress()
    }
}

module.exports = new Other()

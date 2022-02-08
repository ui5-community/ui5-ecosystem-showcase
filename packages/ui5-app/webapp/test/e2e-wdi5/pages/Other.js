const Page = require("./Page")

class Other extends Page {
    _viewName = "test.Sample.view.Other"

    async iShouldSeeTheList() {
        return (
            (await browser
                .asControl({
                    selector: {
                        viewName: "test.Sample.view.Other",
                        id: "PeopleList"
                    }
                })
                .getVisible()) === true
        )
    }

    async iNavigateBack() {
        await browser
            .asControl({
                selector: {
                    id: /.*navButton$/
                }
            })
            .firePress()
    }
}

module.exports = new Other()

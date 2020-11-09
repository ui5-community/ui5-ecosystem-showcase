const title = {
    wdio_ui5_key: 'MainViewTitle',
    forceSelect: true,
    selector: {
        viewName: "test.Sample.view.Main",
        controlType: "sap.m.Title",
        properties: {
            text: "#UI5 demo"
        }
    }
}

const navFwdButton = {
    selector: {
        viewName: "test.Sample.view.Main",
        id: "NavButton"
    }
}

const list = {
    selector: {
        viewName: "test.Sample.view.Other",
        id: "PeopleList"
    }
}

const backButton = {
    selector: {
        id: "__page0-navButton"
    }
}

describe("navigation", () => {
    it("should see the initial page of the app", () => {
        expect(browser.asControl(title).getText()).toBe("#UI5 demo")
    })

    it("should navigate to the list page and back", () => {
        browser.asControl(navFwdButton).firePress()
        expect(browser.asControl(list).getVisible()).toBeTruthy()

        browser.asControl(backButton).firePress()

        expect(browser.asControl(title).getVisible()).toBeTruthy()
    })
})

describe("binding", () => {
    it("Other view: PeopleList: items aggregation + amount of items", () => {
        browser.asControl(navFwdButton).firePress()
        const items = browser.asControl(list).getAggregation("items")
        expect(items.length).toBeGreaterThanOrEqual(1)
    })
})

const title = {
    wdio_ui5_key: "MainViewTitle",
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

const dateTimePicker = {
    forceSelect: true,
    selector: {
        viewName: "test.Sample.view.Main",
        id: "DateTimePicker"
    }
}

describe("navigation", () => {
    it("should see the initial page of the app", () => {
        const oTitle = browser.asControl(oTitle)
        expect(oTitle.getText()).toBe("#UI5 demo")
    })

    it("should navigate to the list page and back", () => {
        browser.asControl(navFwdButton).firePress()
        
        const oList = browser.asControl(list)
        expect(oList.getVisible()).toBeTruthy()

        browser.asControl(backButton).firePress()

        const oTitle = browser.asControl(oTitle)
        expect(oTitle.getVisible()).toBeTruthy()
    })
})

describe("binding", () => {
    it("Other view: PeopleList: items aggregation + amount of items", () => {
        browser.asControl(navFwdButton).firePress()

        const oList = browser.asControl(list)
        const aListItems = oList.getAggregation("items")
        expect(aListItems.length).toBeGreaterThanOrEqual(1)
    })
})

describe.only("interaction", () => {
    it("should manually allow date input", () => {
        const oDateTimePicker = browser.asControl(dateTimePicker)
        oDateTimePicker.setValue("2020-11-11")
        expect(oDateTimePicker.getValue()).toMatch(/2020/)
        expect(oDateTimePicker.getValue()).toMatch(/11/)
    })

    it("should input date via popup + click", () => {
        // no partial regex for ids in wdi5 yet :)
        const popupIcon = $('//*[contains(@id, "DateTimePicker-icon")]') // wdio-native
        popupIcon.click()

        const cal = $('//*[contains(@id, "DateTimePicker-cal")]') // wdio-native
        expect(cal).toBeVisible()

        const next = $('//*[contains(@id, "DateTimePicker-cal--Head-next")]') // wdio-native
        next.click()
        const fifteenth = $('//*[contains(@id, "DateTimePicker-cal--Month0-20201215")]') // wdio-native
        fifteenth.click()

        const ok = $('//*[contains(@id, "DateTimePicker-OK")]') // wdio-native
        ok.click()
        
        const oDateTimePicker = browser.asControl(dateTimePicker) // wdi5 again!
        expect(oDateTimePicker.getValue()).toMatch(/2020/)
        expect(oDateTimePicker.getValue()).toMatch(/15/)

    })
})

const navFwdButton = {
    forceSelect: true,
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

const dateTimePicker = {
    forceSelect: true,
    selector: {
        viewName: "test.Sample.view.Main",
        id: "DateTimePicker"
    }
}

const MainPage = require("./pages/Main")
const onTheOtherPage = require("./pages/Other")

// this suite implemented w/ page object pattern
describe("navigation", () => {
    it("should see the initial page of the app", () => {
        MainPage.open()
        expect(MainPage.iShouldSeeTheApp()).toBeTruthy()
    })

    it("should navigate to the list page and back", () => {
        MainPage.iPressTheNavButton()

        expect(onTheOtherPage.iShouldSeeTheList()).toBeTruthy()

        onTheOtherPage.iNavigateBack()

        expect(MainPage.iShouldSeeTheNavButton()).toBeTruthy()
    })
})

// this suite implemented straigh-fwd, no page objects
describe("binding", () => {
    it("Other view: PeopleList: items aggregation + amount of items", () => {
        browser.asControl(navFwdButton).firePress()

        const oList = browser.asControl(list)
        const aListItems = oList.getItems(true) // ui5 api + high-speed aggregation retrieval https://github.com/js-soft/wdi5#getshorthand-conveniences
        expect(aListItems.length).toBeGreaterThanOrEqual(1)
    })
})

// this suite implemented straigh-fwd, no page objects
describe("interaction", () => {
    it("should manually allow date input", () => {
        browser.goTo({ sHash: "#/" })

        const oDateTimePicker = browser.asControl(dateTimePicker)
        oDateTimePicker.focus()
        oDateTimePicker.setValue("2020-11-11")
        // tmp change focus to different control in order to 
        // trigger ui5 framework events (e.g. date formatting)
        browser.keys("Tab")
        browser.asControl(navFwdButton).focus() // ui5 api
        expect(oDateTimePicker.getValue()).toMatch(/2020/)
        expect(oDateTimePicker.getValue()).toMatch(/11/)
    })

    it("should input date via popup + click", () => {
        // wdi5
        const popupIcon = {
            selector: {
                id: /.*DateTimePicker-icon$/
            }
        }
        browser.asControl(popupIcon).firePress()

        // use wdio + wdi5 mixed up in same test
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

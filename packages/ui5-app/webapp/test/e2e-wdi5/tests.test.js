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
    it("should see the initial page of the app", async () => {
        await MainPage.open()
        expect(MainPage.iShouldSeeTheApp()).toBeTruthy()
    })

    it("should navigate to the list page and back", async () => {
        await MainPage.iPressTheNavButton()

        expect(await onTheOtherPage.iShouldSeeTheList()).toBeTruthy()

        await onTheOtherPage.iNavigateBack()

        expect(await MainPage.iShouldSeeTheNavButton()).toBeTruthy()
    })
})

// this suite implemented straigh-fwd, no page objects
describe("binding", () => {
    it("Other view: PeopleList: items aggregation + amount of items", async () => {
        await browser.asControl(navFwdButton).firePress()

        const oList = await browser.asControl(list)
        const aListItems = await oList.getItems(true) // ui5 api + high-speed aggregation retrieval https://github.com/js-soft/wdi5#getshorthand-conveniences
        expect(aListItems.length).toBeGreaterThanOrEqual(1)
    })
})

// this suite implemented straigh-fwd, no page objects
describe("interaction", () => {
    it("should manually allow date input", async () => {
        await browser.goTo({ sHash: "#/" })

        const oDateTimePicker = await browser.asControl(dateTimePicker)
        await oDateTimePicker.focus().setValue("2020-11-11")
        // tmp change focus to different control in order to
        // trigger ui5 framework events (e.g. date formatting)
        await browser.keys("Tab")
        await browser.asControl(navFwdButton).focus() // ui5 api
        expect(await oDateTimePicker.getValue()).toMatch(/2020/)
        expect(await oDateTimePicker.getValue()).toMatch(/11/)
    })

    it("should input date via popup + click", async () => {
        const today = new Date()
        let month = today.getMonth() + 2 // we want next month
        month = (month < 10 ? "0" + month : month).toString()
        const year = today.getFullYear().toString()

        // wdi5
        const popupIcon = {
            selector: {
                id: /.*DateTimePicker-icon$/
            }
        }
        await browser.asControl(popupIcon).firePress()

        // use wdio + wdi5 mixed up in same test
        const cal = await $('//*[contains(@id, "DateTimePicker-cal")]') // wdio-native
        await expect(cal).toBeDisplayed()

        const next = await $('//*[contains(@id, "DateTimePicker-cal--Head-next")]') // wdio-native
        await next.click()
        const fifteenth = await $(`//*[contains(@id, "DateTimePicker-cal--Month0-${year}${month}15")]`) // wdio-native
        await fifteenth.click()

        const ok = await $('//*[contains(@id, "DateTimePicker-OK")]') // wdio-native
        await ok.click()

        const sDateTimePickerValue = await browser.asControl(dateTimePicker).getValue() // wdi5 again!
        expect(sDateTimePickerValue).toMatch(year)
        expect(sDateTimePickerValue).toMatch(/15/)
    })
})

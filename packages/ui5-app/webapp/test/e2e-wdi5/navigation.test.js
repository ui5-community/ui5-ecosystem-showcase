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

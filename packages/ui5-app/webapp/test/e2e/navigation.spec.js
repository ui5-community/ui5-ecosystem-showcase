const mainPageObject = require("./pages/main.view");
const otherPageObject = require("./pages/other.view");

describe("navigation", function () {
    it("should see the initial page of the app", function () {
        Given.iStartMyApp();
        Then.onTheMainPage.iShouldSeeTheApp();
    });

    it("should navigate to the list page and back", function () {
        When.onTheMainPage.iPressTheNavButton();
        Then.onTheOtherPage.iShouldSeeTheList();

        When.onTheOtherPage.iNavigateBack();
        Then.onTheMainPage.iShouldSeeTheNavButton();
    });
});

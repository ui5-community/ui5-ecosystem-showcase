const MainPage = require("./pages/Main");

// this suite implemented w/ page object pattern
describe("stringreplace", function () {
	it("should see the initial page of the app", async function () {
		await MainPage.open();
		expect(MainPage.iShouldSeeTheApp()).toBeTruthy();
	});

	it("should see the replaced string in the title", async function () {
		const title = await browser.getTitle();
		expect(title).toEqual("Sample UI5 Application 1.0.0-SNAPSHOT");
	});
});

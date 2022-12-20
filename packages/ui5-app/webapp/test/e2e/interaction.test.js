const navFwdButton = {
	forceSelect: true,
	selector: {
		viewName: "test.Sample.view.Main",
		id: "NavButton",
	},
};

const dateTimePicker = {
	forceSelect: true,
	selector: {
		viewName: "test.Sample.view.Main",
		id: "DateTimePicker",
		interaction: "root",
	},
};

// this suite implemented straigh-fwd, no page objects
describe("interaction", function () {
	it("should manually allow date input", async function () {
		await browser.goTo({ sHash: "#/" });

		// wdi5 fluent async api to
		// - focus on the input element of the date picker
		// - type in the date
		await browser.asControl(dateTimePicker).focus().setValue("2020-11-11");

		// change focus to different control in order to
		// trigger ui5 framework event for date formatting
		await browser.keys("Tab");
		await browser.asControl(navFwdButton).focus(); // wdi5 fluent async api

		const newValue = await browser.asControl(dateTimePicker).getValue(); // ui5 api
		expect(newValue).toMatch(/2020/);
		expect(newValue).toMatch(/11/);
	});

	it("should input date via popup + click", async function () {
		const today = new Date();
		today.setMonth(today.getMonth() + 1); // we want next month
		let month = `${today.getMonth() + 1}`.padStart(2, "0");
		const year = today.getFullYear().toString();

		// first, input current date to clear value from previous test
		await browser.asControl(dateTimePicker).focus().setValue("");
		await browser.keys("Tab"); // this triggers ui5 framework event when navigating away from the input element of the datetime picker

		// wdi5
		const popupIcon = {
			selector: {
				id: /.*DateTimePicker-icon$/,
			},
		};
		await browser.asControl(popupIcon).firePress();

		// use wdio + wdi5 mixed up in same test
		const cal = await $('//*[contains(@id, "DateTimePicker-cal")]'); // wdio-native
		await expect(cal).toBeDisplayed();

		const next = await $('//*[contains(@id, "DateTimePicker-cal--Head-next")]'); // wdio-native
		await next.click();
		const fifteenth = await $(`//*[contains(@id, "DateTimePicker-cal--Month0-${year}${month}15")]`); // wdio-native
		await fifteenth.click();

		const ok = await $('//*[contains(@id, "DateTimePicker-OK")]'); // wdio-native
		await ok.click();

		const sDateTimePickerValue = await browser.asControl(dateTimePicker).getValue(); // wdi5 again!
		expect(sDateTimePickerValue).toMatch(year);
		expect(sDateTimePickerValue).toMatch(/15/);
	});
});

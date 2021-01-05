const input = element(
    by.control({
        viewName: "test.Sample.view.Main",
        id: "DateTimePicker"
    })
);
describe("interaction", function () {
    it("should manually allow date input", function () {
        input
            .sendKeys("2020-11-11")
            .then((_) => {
                // this is very likely overlooked...
                return input.sendKeys(protractor.Key.ENTER);
            })
            .then((_) => {
                return input.asControl().getProperty("value");
            })
            .then((value) => {
                expect(value).toMatch(/2020/);
                expect(value).toMatch(/11/);
            })
            .catch((err) => {
                return Promise.reject("gnarf");
            });
    });

    it("should input date via popup + click", function () {
        // open popup
        element(
            by.control({
                viewName: "test.Sample.view.Main",
                id: /.*DateTimePicker-icon/
                // interaction: "press" // didn't work
            })
        ).click();

        const cal = element(
            by.control({
                viewName: "test.Sample.view.Main",
                id: /.*DateTimePicker-cal$/
            })
        );
        expect(cal.asControl().getProperty("visible")).toBe(true);

        // move to next month
        element(
            // doesn't work
            // by.control({
            //     viewName: "test.Sample.view.Main",
            //     id: /.*DateTimePicker-cal--Head-next/,
            // })
            by.id("container-Sample---Main--DateTimePicker-cal--Head-next") // fall back to selenium-webdriver
        ).click();
        // pick the 15th
        element(
            // doesn't work
            // by.control({
            //     viewName: "test.Sample.view.Main",
            //     id: /.*DateTimePicker-cal--Month0-20201215/,
            // })
            by.id("container-Sample---Main--DateTimePicker-cal--Month0-20201215") // fall back to selenium-webdriver
        ).click();

        // close popup via "OK"
        element(
            by.control({
                viewName: "test.Sample.view.Main",
                id: /.*DateTimePicker-OK/,
                controlType: "sap.m.Button"
                // interaction: "press", // didn't work
            })
        ).click();

        // assert the chosen date
        input
            .asControl()
            .getProperty("value")
            .then((value) => {
                expect(value).toMatch(/2020/);
                expect(value).toMatch(/15/);
            })
            .catch((err) => {
                return Promise.reject("gnarf");
            });
    });
});

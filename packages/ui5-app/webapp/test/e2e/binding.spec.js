describe("binding", function () {
    it("Other view: PeopleList: items aggregation", function () {
        element(
            by.control({
                viewName: "test.Sample.view.Main",
                id: "NavButton",
            })
        ).click();

        const list = element(
            by.control({
                viewName: "test.Sample.view.Other",
                id: "PeopleList",
                aggregationFilled: [{ name: "items" }],
            })
        );

        expect(list.asControl().getProperty("headerText")).toMatch(/bites the dust/);
    });

    it("amount of items", function () {
        const list = element.all(
            by.control({
                viewName: "test.Sample.view.Other",
                controlType: "sap.m.StandardListItem",
            })
        );
        expect(list.count()).toBeGreaterThan(2);
    });
});

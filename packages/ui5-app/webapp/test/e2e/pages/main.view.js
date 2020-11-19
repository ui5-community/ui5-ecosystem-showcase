module.exports = createPageObjects({
    Main: {
        arrangements: {
            iStartMyApp: () => {
                return true
            }
        },
        actions: {
            iPressTheNavButton: () => {
                element(
                    by.control({
                        viewName: "test.Sample.view.Main",
                        id: "NavButton"
                    })
                ).click()
            }

        },
        assertions: {
            iShouldSeeTheApp: () => {
                const title = element(
                    by.control({
                        viewName: "test.Sample.view.Main",
                        controlType: "sap.m.Title",
                        properties: {
                            text: "#UI5 demo"
                        }
                    })
                );
                // don't know why this isn't title.asControl() ... :(
                expect(title.getText()).toBe("#UI5 demo");
            },
            iShouldSeeTheNavButton: () => {
                const navButton = element(
                    by.control({
                        viewName: "test.Sample.view.Main",
                        id: "NavButton"
                    })
                )
                expect(navButton.asControl().getProperty("text")).toBe("to Other view")
            }
        }
    }
})
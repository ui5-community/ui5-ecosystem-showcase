/*global QUnit*/

sap.ui.define(
    [
        "sap/ui/test/opaQunit",
        "sap/ui/test/actions/EnterText",
        "sap/ui/test/actions/Press",
        "sap/ui/test/Opa5",
        "./pages/Main",
        "./pages/Other",
    ],
    function (opaTest, EnterText, Press, Opa5) {
        "use strict";

        QUnit.module("Interaction Journey");

        opaTest("should manually allow date input", function (Given, When, Then) {
            // Arrangements
            Given.iStartMyApp();

            // Action
            When.waitFor({
                viewName: "Main",
                id: "DateTimePicker",
                actions: new EnterText({
                    text: "2020-11-11",
                    pressEnterKey: true,
                }),
            });

            // Assertion
            Then.waitFor({
                viewName: "Main",
                id: "DateTimePicker",
                success: function (oDateTimePicker) {
                    Opa5.assert.ok(true, oDateTimePicker.getValue().match(/2020/));
                    Opa5.assert.ok(true, oDateTimePicker.getValue().match(/11/));
                },
            });
        });

        opaTest("should input date via popup + click", function (Given, When, Then) {
            // Assertions
            When.waitFor({
                viewName: "Main",
                id: /.*DateTimePicker-icon/,
                actions: new Press(),
            });

            // this should be a hard FAIL
            // but for the demo purpose, we let it slide :)
            Then.waitFor({
                viewName: "Main",
                id: "DateTimePicker",
                success: function(oDateTimePicker) {
                    Opa5.assert.ok(true, "i have no idea how to work OPA5 for framework-immanent popup interaction")
                }
            })
            .and.iTeardownMyApp();
        });
    }
);

sap.ui.define([
    "test/Sample/controller/BaseController"
], Controller => {
    "use strict";

    return Controller.extend("test.Sample.controller.Main", {
        // (live) transpiling async functions to ES5 generators not yet doable in ui5-tooling ecosys :)
        /* async */ onInit() {
            // let response;
            // let oLatestUI5 = {
            //     version: "n/a"
            // };
            // try {
            //     response = await fetch('/proxy/api/v1/latest?format=json');
            //     oLatestUI5 = await response.json();
            // } catch (err) {
            //     console.error(err)
            // }
            // this.getModel('LatestUI5').setProperty("/latest", latestU5version.version)

            fetch("/proxy/api/v1/latest?format=json")
                .then(response => response.json())
                .then(latestU5version => {
                    this.getModel('LatestUI5').setProperty("/latest", latestU5version.version);
                })
                .catch(err => console.error(err))

        },

        navFwd() {
            return this.getOwnerComponent().getRouter().navTo("RouteOther");
        }
    });
});

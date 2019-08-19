sap.ui.define([
    "test/Sample/controller/BaseController"
], function (Controller) {
    "use strict";

    return Controller.extend("test.Sample.controller.Main", {
        async onInit() {
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
                    this.getModel('LatestUI5').setProperty("/latest", latestU5version.version)
                })
                .catch(err => console.error(err))

        },

        navFwd(oEvent) {
            this.getOwnerComponent().getRouter().navTo("RouteOther");
        }
    });
});

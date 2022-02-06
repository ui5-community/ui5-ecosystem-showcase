sap.ui.define([
	"test/Sample/controller/BaseController",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageBox"
], (Controller, ODataModel, MessageBox) => {
	"use strict";

	return Controller.extend("test.Sample.controller.ModelView", {
		onInit() {
            // Never load your model in the onInit function. Always use the manifest possible. This is just for example purposes
            const oModel = new ODataModel({
                loadMetadataAsync : false,
                serviceUrl: "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/"});
            oModel.attachMetadataFailed(() => {
                MessageBox.error("This view is an example of the onelogin middleware, check the sample folder in the package");
            });
            this.getView().setModel(oModel, "SAPES5")
		},

        getStatus: function(sStatus) {
            switch (sStatus) {
                case "A":
                    return "Error";
                case "B":
                    return "Warning";
                case "C":
                    return "Success";
                default:
                    return "";
            }
        }
	});
});

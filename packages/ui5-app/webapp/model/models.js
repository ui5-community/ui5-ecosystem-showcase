sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], (JSONModel, Device) => {
	"use strict";

	return {

		createDeviceModel() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};
});
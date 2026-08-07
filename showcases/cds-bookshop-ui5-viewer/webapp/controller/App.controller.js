sap.ui.define(
	["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/ui/model/Filter", "sap/ui/model/FilterType", "sap/ui/model/FilterOperator", "sap/m/MessageToast"],
	function (Controller, JSONModel, Filter, FilterType, FilterOperator) {
		"use strict";

		return Controller.extend("ui5.bookshopviewer.controller.App", {
			onSearch: function (oEvent) {
				const sValue = oEvent.getParameter("newValue"),
					oFilter = new Filter("title", FilterOperator.Contains, sValue);
				this.byId("booksTable").getBinding("items").filter(oFilter, FilterType.Application);
				this.onSelect(); // reset the selection
			},
		});
	},
);

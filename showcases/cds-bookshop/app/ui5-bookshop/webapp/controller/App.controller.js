sap.ui.define(
	["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/ui/model/Filter", "sap/ui/model/FilterType", "sap/ui/model/FilterOperator", "sap/m/MessageToast"],
	function (Controller, JSONModel, Filter, FilterType, FilterOperator, MessageToast) {
		"use strict";

		return Controller.extend("ui5.bookshop.controller.App", {
			onInit: function () {
				this.getView().setModel(
					new JSONModel({
						quantity: 1,
						status: "",
					}),
					"order"
				);
			},
			onSelect: function (oEvent) {
				const selectedBook = this.byId("selectedBook"),
					oModel = this.getView().getModel("order");
				selectedBook.bindContext(oEvent ? oEvent.getSource().getBindingContextPath() : "");
				// reset the order information
				oModel.setProperty("/quantity", 1);
				oModel.setProperty("/selectedItemData", oEvent?.getSource().getBindingContext().getValue());
			},
			onSubmitOrder: async function () {
				const view = this.getView(),
					orderModel = view.getModel("order"),
					i18nModel = view.getModel("i18n");
				// fetch API (/!\ in Cloud Portal scenarios not covered by doorway mapping)
				fetch("/bookshop/submitOrder", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						book: orderModel.getProperty("/selectedItemData/ID"),
						quantity: orderModel.getProperty("/quantity"),
					}),
				})
					.then((response) => {
						MessageToast.show(i18nModel.getProperty(response.ok ? "OrderSuccessful" : "OrderError"));
						this.getView().getModel().refresh();
					})
					.catch(() => {
						MessageToast.show(i18nModel.getProperty("OrderError"));
						this.getView().getModel().refresh();
					});
			},
			onSearch: function (oEvent) {
				const sValue = oEvent.getParameter("newValue"),
					oFilter = new Filter("title", FilterOperator.Contains, sValue);
				this.byId("booksTable").getBinding("items").filter(oFilter, FilterType.Application);
				this.onSelect(); // reset the selection
			},
		});
	}
);

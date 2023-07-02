import JSONModel from "sap/ui/model/json/JSONModel";
import Device from "sap/ui/Device";
import type { TypedJSONModel, TypedJSONModelData } from "ui5-types-typedjsonmodel/lib/TypedJSONModel";

export function createDeviceModel(): JSONModel {
	const model = new JSONModel(Device);
	model.setDefaultBindingMode("OneWay");
	return model;
}

export function createTypedJSONModel<T extends TypedJSONModelData>(oData: T, bObserve?: boolean | undefined) {
	return new JSONModel(oData, bObserve) as TypedJSONModel<T>;
}

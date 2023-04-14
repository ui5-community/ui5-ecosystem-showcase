import JSONModel from "sap/ui/model/json/JSONModel";
import Device from "sap/ui/Device";

import type { TypeSafeJsonModel, TypeSafeJSONModelData } from "ui5-tsutil/lib/TypeSafeJSONModel";

export function createDeviceModel(): JSONModel {
	const model = new JSONModel(Device);
	model.setDefaultBindingMode("OneWay");
	return model;
}

export function createTypedJSONModel<T extends TypeSafeJSONModelData>(oData: T, bObserve?: boolean | undefined) {
	return new JSONModel(oData, bObserve) as TypeSafeJsonModel<T>;
}

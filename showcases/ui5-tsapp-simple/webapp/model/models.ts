import JSONModel from "sap/ui/model/json/JSONModel";
import Device from "sap/ui/Device";
import { TypeSafeJsonModel } from "ui5-tsutil/lib/TypeSafeJSONModel";

export function createDeviceModel(): JSONModel {
	const model = new JSONModel(Device);
	model.setDefaultBindingMode("OneWay");
	return model;
}

/**
 * JSON safe object
 */
type JSONObject = {
	[x: string]: JSONObject;
};

export function createTypedJSONModel(): TypeSafeJsonModel<JSONObject> {
	const model = new JSONModel();
	return model as TypeSafeJsonModel<JSONObject>;
}

/* eslint-disable */
import hyphenate from "sap/base/strings/hyphenate";
import WebComponent from "sap/ui/core/webc/WebComponent";
import WebComponentRenderer from "sap/ui/core/webc/WebComponentRenderer";
import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
// import Button from "@ui5/webcomponents/Button";
// import DatePicker from "@ui5/webcomponents/DatePicker";
import Control from "sap/ui/core/Control";
import VBox from "sap/m/VBox";
import Popup from "sap/ui/core/Popup";
import Event from "sap/ui/base/Event";
//import "@ui5/webcomponents/library";

WebComponentRenderer.renderAttributeProperties = function (oRm, oWebComponent) {
	var oAttrProperties = oWebComponent.getMetadata().getPropertiesByMapping("property");
	var aPropsToAlwaysSet = ["enabled"].concat(
		Object.entries(oWebComponent.getMetadata().getPropertyDefaults()).map(([key, value]) => {
			return value !== undefined && value !== false ? key : null;
		})
	); // some properties can be initial and still have a non-default value due to side effects (e.g. EnabledPropagator)
	for (var sPropName in oAttrProperties) {
		if (oWebComponent.isPropertyInitial(sPropName) && !aPropsToAlwaysSet.includes(sPropName)) {
			continue; // do not set attributes for properties that were not explicitly set or bound
		}

		var oPropData = oAttrProperties[sPropName];
		var vPropValue = oPropData.get(oWebComponent);
		if (oPropData.type === "object" || typeof vPropValue === "object") {
			continue; // Properties of type "object" and custom-type properties with object values are set during onAfterRendering
		}

		var sAttrName = oPropData._sMapTo ? oPropData._sMapTo : hyphenate(sPropName);
		if (oPropData._fnMappingFormatter) {
			vPropValue = oWebComponent[oPropData._fnMappingFormatter].call(oWebComponent, vPropValue);
		}

		if (oPropData.type === "boolean") {
			if (vPropValue) {
				oRm.attr(sAttrName, "");
			}
		} else {
			if (vPropValue != null) {
				oRm.attr(sAttrName, vPropValue);
			}
		}
	}
};

/**
 * @namespace ui5.ecosystem.demo.simpletsapp.controller
 */
export default class Main extends Controller {
	public onInit(): void {
		// const button = new Button({ text: "👻", click: this.onBoo });
		// if (button instanceof Control) {
		// 	(this.getView()?.byId("contentArea") as VBox).addItem(button);
		// }
		// const datePicker = new DatePicker({ placeholder: "📅" });
		// if (datePicker instanceof Control) {
		// 		(this.getView()?.byId("contentArea") as VBox).addItem(datePicker);
		// }
	}
	public onBoo(): void {
		MessageToast.show(`👻`);
	}
	public onLiveChange(e: Event): void {
		MessageToast.show(`🛠️ liveChange: ${e.getParameter("selectedOption").getText()}`, { at: Popup.Dock.CenterCenter });
	}
}

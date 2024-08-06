import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import Button from "@ui5/webcomponents/Button";
import DatePicker from "@ui5/webcomponents/DatePicker";
import Control from "sap/ui/core/Control";
import VBox from "sap/m/VBox";
import Popup from "sap/ui/core/Popup";
import Event from "sap/ui/base/Event";

/*

	// TODO: WebComponent.patch (for properties, aggregations, events, methods, ...)

	const WebComponentProperty = GeomapSpot.getMetadata().metaFactoryProperty;
	GeomapSpot.getMetadata()._mProperties["lng"] = GeomapSpot.getMetadata()._mAllProperties["lng"] = new WebComponentProperty(GeomapSpot.getMetadata(), "lng", {
		type: "float",
	});
	GeomapSpot.getMetadata()._mProperties["lat"] = GeomapSpot.getMetadata()._mAllProperties["lat"] = new WebComponentProperty(GeomapSpot.getMetadata(), "lat", {
		type: "float",
	});
	GeomapSpot.getMetadata().generateAccessors();

    --- or ---

	const ExtendedGeomapSpot = GeomapSpot.extend("sap.ui.geomap.GeomapSpot", {
		metadata: {
			tag: "sap-geomap-spot", // tag info gets lost in extend
			properties: {
				"lng": {
					type: "float",
				},
				"lat": {
					type: "float",
				},
			},
		},
	});

*/

/**
 * @namespace ui5.ecosystem.demo.simpletsapp.controller
 */
export default class Main extends Controller {
	public onInit(): void {
		const button = new Button({ text: "👻", click: this.onBoo });
		if (button instanceof Control) {
			(this.getView()?.byId("contentArea") as VBox).addItem(button);
		}
		const datePicker = new DatePicker({ placeholder: "📅" });
		if (datePicker instanceof Control) {
				(this.getView()?.byId("contentArea") as VBox).addItem(datePicker);
		}
	}
	public onBoo(): void {
		MessageToast.show(`👻`);
	}
	public onLiveChange(e:Event): void {
		MessageToast.show(`🛠️ liveChange: ${e.getParameter("selectedOption").getText()}`, { at: Popup.Dock.CenterCenter });
	}
}

import UIComponent from "sap/ui/core/UIComponent";
import { createDeviceModel } from "./model/models";
import "./webc/WebComponentPolyfill";

/**
 * @namespace ui5.ecosystem.demo.simpletsapp
 */
export default class Component extends UIComponent {
	public static metadata = {
		manifest: "json",
	};

	public init(): void {
		// call the base component's init function
		super.init();
		// enable routing
		this.getRouter().initialize();
		// set the device model
		this.setModel(createDeviceModel(), "device");
	}
}

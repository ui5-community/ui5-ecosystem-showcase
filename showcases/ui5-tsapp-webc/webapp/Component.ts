import UIComponent from "sap/ui/core/UIComponent";
import { createDeviceModel } from "./model/models";

// commented in favor of automatic inclusion via ui5.yaml
//import "@ui5/webcomponents/dist/Assets";
//import "@ui5/webcomponents-fiori/dist/Assets";

/**
 * @namespace ui5.ecosystem.demo.webctsapp
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

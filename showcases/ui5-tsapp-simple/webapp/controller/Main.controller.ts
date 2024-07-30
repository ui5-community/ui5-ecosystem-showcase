import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import Button from "@ui5/webcomponents/Button";
import Text from "@ui5/webcomponents/Avatar";
import Control from "sap/ui/core/Control";
import VBox from "sap/m/VBox";

/**
 * @namespace ui5.ecosystem.demo.simpletsapp.controller
 */
export default class Main extends Controller {
	public onInit(): void {
		const button = new Button({ text: "👻", click: this.onBoo });
		if (button instanceof Control) {
			(this.getView()?.byId("contentArea") as VBox).addItem(button);
		}
	}
	public onBoo(): void {
		MessageToast.show(`👻`);
	}
}

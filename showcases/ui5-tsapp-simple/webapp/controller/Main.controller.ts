import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";

/**
 * @namespace ui5.ecosystem.demo.simpletsapp.controller
 */
export default class Main extends Controller {
	public onBoo(): void {
		MessageToast.show(`👻`);
	}
}

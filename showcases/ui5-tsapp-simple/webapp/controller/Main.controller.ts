import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";

export default class Main extends Controller {
	public onBoo(): void {
		MessageToast.show(`👻`);
	}
}

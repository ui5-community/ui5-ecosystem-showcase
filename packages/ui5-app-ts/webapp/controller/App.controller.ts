/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment */
import Controller from "sap/ui/core/mvc/Controller";
import AppComponent from "../Component";

/**
 * @namespace ui5.ecosystem.demo.tsapp.controller
 */
export default class App extends Controller {
	public onInit(): void {
		// apply content density mode to root view
		const view = this.getView();
		if (view) {
			view.addStyleClass((this.getOwnerComponent() as AppComponent).getContentDensityClass());
		}
	}
}

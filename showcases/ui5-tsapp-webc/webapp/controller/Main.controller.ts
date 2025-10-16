/* eslint-disable */
import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import OverflowToolbar from "sap/m/OverflowToolbar";
import Control from "sap/ui/core/Control";
import VBox from "sap/m/VBox";
import Popup from "sap/ui/core/Popup";
import Event from "sap/ui/base/Event";

import Button from "@ui5/webcomponents/dist/Button";
import DatePicker from "@ui5/webcomponents/dist/DatePicker";
import Input from "@ui5/webcomponents/dist/Input";
import { AvatarSize } from "@ui5/webcomponents";
import Token from "@ui5/webcomponents/dist/Token";

import UserMenu from "@ui5/webcomponents-fiori/dist/UserMenu";
import UIComponent from "sap/ui/core/UIComponent";
import Popover from "@ui5/webcomponents/dist/Popover";

import { Select$LiveChangeEvent } from "@ui5/webcomponents/dist/Select";
import Option from "@ui5/webcomponents/dist/Option";
import MultiInput, { MultiInput$TokenDeleteEvent } from "@ui5/webcomponents/dist/MultiInput";

// HTML Elements
import Progress from "@ui5/html/dist/Progress";

function injectStyle() {
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(`
.panelSpacing {
	margin: 10px;
}
.buttonSpacing {
	margin: 2px;
}
.popover-content {
	display: flex;
	flex-direction: column;
	justify-content: center;
}
`);
	document.adoptedStyleSheets.push(sheet);
}

/**
 * @namespace ui5.ecosystem.demo.webctsapp.controller
 */
export default class Main extends Controller {
	private animationId: number = 0;
	private isAnimating: boolean = false;

	public onInit(): void {
		injectStyle();

		const button = new Button({ text: "👻", click: this.onBoo });
		(this.byId("contentArea") as VBox).addItem(button);
		console.log(`Button is a sap.ui.core.WebComponent: ${button.isA("sap.ui.core.WebComponent")}`);
		console.log(`Button is a @ui5.webcomponents.dist.Button: ${button.isA("@ui5.webcomponents.dist.Button")}`);
		console.log(`Button is not a @ui5.webcomponents.Button: ${button.isA("@ui5.webcomponents.Button")}`);

		const datePicker = new DatePicker({ placeholder: "📅" });
		(this.byId("contentArea") as VBox).addItem(datePicker);

		console.log(`DatePicker is a @ui5.webcomponents.dist.DatePicker: ${datePicker.isA("@ui5.webcomponents.dist.DatePicker")}`);
		const input = new Input({ value: "🚀🚀🚀" });
		(this.byId("contentArea") as VBox).addItem(input);

		console.log(`Input is a @ui5.webcomponents.dist.Input: ${input.isA("@ui5.webcomponents.dist.Input")}`);
		console.log(`Input is a @ui5.webcomponents.Input: ${input.isA("@ui5.webcomponents.Input")}`);
	}

	public onNativeClick(): void {
		this.isAnimating = !this.isAnimating;

		if (!this.isAnimating) {
			cancelAnimationFrame(this.animationId);
		}

		this.animate();
	}

	public animate() {
		if (!this.isAnimating) return;
		const progressBar = this.byId("myProgressBar") as unknown as Progress;

		let v = parseInt(progressBar.getValue(), 10) + 1;
		v %= 100;
		progressBar.setValue(`${v}`);

		// Continue animation
		this.animationId = requestAnimationFrame(this.animate.bind(this));
	}

	public onNavToDynamicPage(): void {
		(this.getOwnerComponent() as UIComponent).getRouter().navTo("DynamicPage");
	}

	public onNavToForm(): void {
		(this.getOwnerComponent() as UIComponent).getRouter().navTo("FormPage");
	}

	public onNavToValueState(): void {
		(this.getOwnerComponent() as UIComponent).getRouter().navTo("ValueState");
	}

	public onProfileClick(evt: Event): void {
		const um = this.getView()?.byId("userMenu") as UserMenu;
		um?.setOpen(true);
	}

	public onBoo(): void {
		MessageToast.show(`👻`);
	}

	public onLiveChange(e: Select$LiveChangeEvent): void {
		MessageToast.show(`🛠️ liveChange: ${(e.getParameter("selectedOption") as Option).getText()}`, { at: Popup.Dock.CenterCenter });
	}

	/**
	 * Deletes a token from the MultiInput's "token" aggregation.
	 */
	public deleteToken(e: MultiInput$TokenDeleteEvent): void {
		const deletedTokens: Token[] = e.getParameter("tokens");
		deletedTokens.forEach((t: Token) => {
			const multiInput = t.getParent() as MultiInput;
			multiInput.removeToken(t);
		});
	}

	// wire popover opener buttons
	public onPopoverOpener1Click(e: Event): void {
		const poppy1 = this.byId("popover1") as Popover;
		poppy1?.setOpen(!poppy1?.getOpen());
	}
	public onPopoverOpener2Click(e: Event): void {
		const poppy2 = this.byId("popover2") as Popover;
		poppy2?.setOpen(!poppy2?.getOpen());
	}

	/**
	 * Toggles the 'enabled' state of the OverflowToolbar to test the
	 * propagation of the 'enabled' state to child controls.
	 */
	public toggleOverflowToolbarEnabled(e: Event): void {
		const ovt: OverflowToolbar = this.byId("overflowToolbar") as OverflowToolbar;
		ovt.setEnabled(!ovt.getEnabled());
	}
}

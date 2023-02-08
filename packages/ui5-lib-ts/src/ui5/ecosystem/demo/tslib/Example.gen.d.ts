import { ExampleColor } from "./library";
import Event from "sap/ui/base/Event";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $ControlSettings } from "sap/ui/core/Control";

declare module "./Example" {
	/**
	 * Interface defining the settings object used in constructor calls
	 */
	interface $ExampleSettings extends $ControlSettings {
		text?: string | PropertyBindingInfo;
		color?: ExampleColor | PropertyBindingInfo | `{${string}}`;
		press?: (event: Event) => void;
	}

	export default interface Example {
		// property: text
		getText(): string;
		setText(text: string): this;

		// property: color
		getColor(): ExampleColor;
		setColor(color: ExampleColor): this;

		// event: press
		attachPress(fn: (event: Event) => void, listener?: object): this;
		attachPress<CustomDataType extends object>(data: CustomDataType, fn: (event: Event, data: CustomDataType) => void, listener?: object): this;
		detachPress(fn: (event: Event) => void, listener?: object): this;
		firePress(parameters?: object): this;
	}
}

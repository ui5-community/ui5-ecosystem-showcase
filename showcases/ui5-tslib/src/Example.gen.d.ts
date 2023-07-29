import { ExampleColor } from "ui5/ecosystem/demo/tslib/library";
import Event from "sap/ui/base/Event";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $ControlSettings } from "sap/ui/core/Control";

declare module "./Example" {
	/**
	 * Interface defining the settings object used in constructor calls
	 */
	interface $ExampleSettings extends $ControlSettings {
		/**
		 * The text to display.
		 */
		text?: string | PropertyBindingInfo;

		/**
		 * The color to use (default to "Default" color).
		 */
		color?: ExampleColor | PropertyBindingInfo | `{${string}}`;

		/**
		 * Event is fired when the user clicks the control.
		 */
		press?: (event: Event) => void;
	}

	export default interface Example {
		// property: text

		/**
		 * Gets current value of property "text".
		 *
		 * The text to display.
		 *
		 * @returns Value of property "text"
		 */
		getText(): string;

		/**
		 * Sets a new value for property "text".
		 *
		 * The text to display.
		 *
		 * When called with a value of "null" or "undefined", the default value of the property will be restored.
		 *
		 * @param text New value for property "text"
		 * @returns Reference to "this" in order to allow method chaining
		 */
		setText(text: string): this;

		// property: color

		/**
		 * Gets current value of property "color".
		 *
		 * The color to use (default to "Default" color).
		 *
		 * Default value is: "ExampleColor.Default,"
		 * @returns Value of property "color"
		 */
		getColor(): ExampleColor;

		/**
		 * Sets a new value for property "color".
		 *
		 * The color to use (default to "Default" color).
		 *
		 * When called with a value of "null" or "undefined", the default value of the property will be restored.
		 *
		 * Default value is: "ExampleColor.Default,"
		 * @param [color="ExampleColor.Default,"] New value for property "color"
		 * @returns Reference to "this" in order to allow method chaining
		 */
		setColor(color: ExampleColor): this;

		// event: press

		/**
		 * Attaches event handler "fn" to the "press" event of this "Example".
		 *
		 * Event is fired when the user clicks the control.
		 *
		 * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
		 * otherwise it will be bound to this "Example" itself.
		 *
		 * @param fn The function to be called when the event occurs
		 * @param listener Context object to call the event handler with. Defaults to this "Example" itself
		 *
		 * @returns Reference to "this" in order to allow method chaining
		 */
		attachPress(fn: (event: Event) => void, listener?: object): this;

		/**
		 * Attaches event handler "fn" to the "press" event of this "Example".
		 *
		 * Event is fired when the user clicks the control.
		 *
		 * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
		 * otherwise it will be bound to this "Example" itself.
		 *
		 * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
		 * @param fn The function to be called when the event occurs
		 * @param listener Context object to call the event handler with. Defaults to this "Example" itself
		 *
		 * @returns Reference to "this" in order to allow method chaining
		 */
		attachPress<CustomDataType extends object>(data: CustomDataType, fn: (event: Event, data: CustomDataType) => void, listener?: object): this;

		/**
		 * Detaches event handler "fn" from the "press" event of this "Example".
		 *
		 * Event is fired when the user clicks the control.
		 *
		 * The passed function and listener object must match the ones used for event registration.
		 *
		 * @param fn The function to be called, when the event occurs
		 * @param listener Context object on which the given function had to be called
		 * @returns Reference to "this" in order to allow method chaining
		 */
		detachPress(fn: (event: Event) => void, listener?: object): this;

		/**
		 * Fires event "press" to attached listeners.
		 *
		 * Event is fired when the user clicks the control.
		 *
		 * @param parameters Parameters to pass along with the event
		 * @returns Reference to "this" in order to allow method chaining
		 */
		firePress(parameters?: object): this;
	}
}

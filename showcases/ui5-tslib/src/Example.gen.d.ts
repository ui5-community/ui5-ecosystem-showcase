import Event from "sap/ui/base/Event";
import { ExampleColor } from "ui5/ecosystem/demo/tslib/library";
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
        press?: (event: Example$PressEvent) => void;
    }

    export default interface Example {

        // property: text

        /**
         * The text to display.
         */
        getText(): string;

        /**
         * The text to display.
         */
        setText(text: string): this;

        // property: color

        /**
         * The color to use (default to "Default" color).
         */
        getColor(): ExampleColor;

        /**
         * The color to use (default to "Default" color).
         */
        setColor(color: ExampleColor): this;

        // event: press

        /**
         * Event is fired when the user clicks the control.
         */
        attachPress(fn: (event: Example$PressEvent) => void, listener?: object): this;

        /**
         * Event is fired when the user clicks the control.
         */
        attachPress<CustomDataType extends object>(data: CustomDataType, fn: (event: Example$PressEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Event is fired when the user clicks the control.
         */
        detachPress(fn: (event: Example$PressEvent) => void, listener?: object): this;

        /**
         * Event is fired when the user clicks the control.
         */
        firePress(parameters?: Example$PressEventParameters): this;
    }

    /**
     * Interface describing the parameters of Example's 'press' event.
     * Event is fired when the user clicks the control.
     */
    // eslint-disable-next-line
    export interface Example$PressEventParameters {
    }

    /**
     * Type describing the Example's 'press' event.
     * Event is fired when the user clicks the control.
     */
    export type Example$PressEvent = Event<Example$PressEventParameters>;
}

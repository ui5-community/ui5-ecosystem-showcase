import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $ControlSettings } from "sap/ui/core/Control";

declare module "./SimpleControl" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $SimpleControlSettings extends $ControlSettings {
        text?: string | PropertyBindingInfo;
    }

    export default interface SimpleControl {

        // property: text
        getText(): string;
        setText(text: string): this;
    }
}

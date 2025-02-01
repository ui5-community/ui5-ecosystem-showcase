import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $ControlSettings } from "sap/ui/core/Control";

declare module "./OtherControl" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $OtherControlSettings extends $ControlSettings {
        text?: string | PropertyBindingInfo;
    }

    export default interface OtherControl {

        // property: text
        getText(): string;
        setText(text: string): this;
    }
}

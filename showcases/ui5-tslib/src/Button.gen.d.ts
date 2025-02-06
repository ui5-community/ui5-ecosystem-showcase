import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $WebComponentSettings } from "sap/ui/core/webc/WebComponent";

declare module "./Button" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $ButtonSettings extends $WebComponentSettings {

        /**
         * The text to display.
         */
        specialText?: string | PropertyBindingInfo;
    }

    export default interface Button {

        // property: specialText

        /**
         * The text to display.
         */
        getSpecialText(): string;

        /**
         * The text to display.
         */
        setSpecialText(specialText: string): this;
    }
}

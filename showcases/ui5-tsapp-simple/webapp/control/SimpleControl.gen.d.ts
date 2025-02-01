import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $OtherControlSettings } from "./OtherControl";

declare module "./SimpleControl" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $SimpleControlSettings extends $OtherControlSettings {
        additionalText?: string | PropertyBindingInfo;
    }

    export default interface SimpleControl {

        // property: additionalText
        getAdditionalText(): string;
        setAdditionalText(additionalText: string): this;
    }
}

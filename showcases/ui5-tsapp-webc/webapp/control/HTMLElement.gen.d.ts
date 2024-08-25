import Control from "sap/ui/core/Control";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { AggregationBindingInfo } from "sap/ui/base/ManagedObject";
import { $ControlSettings } from "sap/ui/core/Control";

declare module "./HTMLElement" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $HTMLElementSettings extends $ControlSettings {
        text?: string | PropertyBindingInfo;
        tag?: string | PropertyBindingInfo;
        children?: Control[] | Control | AggregationBindingInfo | `{${string}}`;
    }

    export default interface HTMLElement {

        // property: text
        getText(): string;
        setText(text: string): this;

        // property: tag
        getTag(): string;
        setTag(tag: string): this;

        // aggregation: children
        getChildren(): Control[];
        addChild(children: Control): this;
        insertChild(children: Control, index: number): this;
        removeChild(children: number | string | Control): this;
        removeAllChildren(): Control[];
        indexOfChild(children: Control): number;
        destroyChildren(): this;
    }
}

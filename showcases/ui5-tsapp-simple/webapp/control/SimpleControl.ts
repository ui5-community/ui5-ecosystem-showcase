import Control from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";
import type { MetadataOptions } from "sap/ui/core/Element";

/**
 * @namespace ui5.ecosystem.demo.simpletsapp.control
 */
export default class SimpleControl extends Control {
	static readonly metadata: MetadataOptions = {
		properties: {
			text: "string",
		},
	};

	// The following three lines were generated and should remain as-is to make TypeScript aware of the constructor signatures
	constructor(idOrSettings?: string | $SimpleControlSettings);
	constructor(id?: string, settings?: $SimpleControlSettings);
	constructor(id?: string, settings?: $SimpleControlSettings) {
		super(id, settings);
	}

	renderer = {
		apiVersion: 2,
		render: (rm: RenderManager, control: SimpleControl) => {
			rm.openStart("div", control);
			rm.style("font-size", "2rem");
			rm.style("height", "2rem");
			rm.style("display", "inline-block");
			rm.style("color", "blue");
			rm.style("padding", ".5rem");
			rm.style("border", "1px dashed lightblue");
			rm.style("margin-bottom", "5px");
			rm.attr("title", "${project.version}");
			rm.openEnd();
			rm.text(control.getText());
			rm.close("div");
		},
	};
}

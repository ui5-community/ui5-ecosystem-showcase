import { ExampleColor } from "ui5/ecosystem/demo/tslib/library";
import Example from "ui5/ecosystem/demo/tslib/Example";

// create a new instance of the Example control and
// place it into the DOM element with the id "content"
new Example({
	text: "Example",
	color: ExampleColor.Highlight,
}).placeAt("content");

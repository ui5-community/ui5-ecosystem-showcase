import { ExampleColor } from "ui5/ecosystem/demo/tslib/library";
import Example from "ui5/ecosystem/demo/tslib/Example";
import Button from "ui5/ecosystem/demo/tslib/Button";

// create a new instance of the Example control and
// place it into the DOM element with the id "content"
new Example({
	text: "Example",
	color: ExampleColor.Highlight,
}).placeAt("content");

/* TODO:
 *   - Transitive dependencies are not considered (only if added to package.json and tsconfig.json)
 *   - 2.7.0 introduces problems with lazy loading of the JSX runtime
 */

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
new Button({
	text: "Hello World",
}).placeAt("content");

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call */
import { ExampleColor } from "ui5/ecosystem/demo/tslib/library";
import Example from "ui5/ecosystem/demo/tslib/Example";
import capitalize from "ui5/ecosystem/demo/tslib/util/capitalize";
import md2html from "ui5/ecosystem/demo/tslib/util/md2html";
import Button from "@ui5/webcomponents/dist/Button";

// create a new instance of the Example control and
// place it into the DOM element with the id "content"
new Example({
	text: "Example",
	color: ExampleColor.Highlight,
}).placeAt("content");

console.log(`Capitalized text: ${capitalize("hello world")}`);
console.log(`Markdown to HTML: ${md2html("## Hello World")}`);

new (Button as any)({
	text: "Click Me",
}).placeAt("content");

import { ExampleColor } from "ui5/ecosystem/demo/tslib/library";
import Example from "ui5/ecosystem/demo/tslib/Example";

// prepare DOM
const elem = document.createElement("div");
elem.id = "uiArea1";
document.body.appendChild(elem);

// module for basic checks
QUnit.module("Example Tests");

// example sync test
QUnit.test("Sync", function (assert) {
	assert.expect(1);
	assert.ok(true, "ok");
});

// example async test
QUnit.test("Async", function (assert) {
	assert.expect(1);
	return new Promise(function (resolve /*, reject */) {
		assert.ok(true, "ok");
		resolve();
	});
});

// module for basic checks
QUnit.module("Basic Control Checks");

// some basic control checks
QUnit.test("Test get properties", function (assert) {
	assert.expect(2);
	const oExample = new Example({
		text: "Example",
	});
	assert.equal(oExample.getText(), "Example", "Check text equals 'Example'");
	assert.equal(oExample.getColor(), ExampleColor.Default, "Check color equals 'Default'");
});

// some basic eventing check
QUnit.test("Test click event", function (assert) {
	assert.expect(1);
	const oExample = new Example("example", {
		text: "Example",
		press: function () {
			assert.ok(true, "Event has been fired!");
		},
	}).placeAt("uiArea1");
	return new Promise(function (resolve /*, reject */) {
		setTimeout(function () {
			oExample.$().trigger(jQuery.Event("click"));
			resolve();
		}, 100);
	});
});

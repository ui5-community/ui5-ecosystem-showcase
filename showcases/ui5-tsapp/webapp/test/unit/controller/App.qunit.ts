import MainController from "ui5/ecosystem/demo/tsapp/controller/Main.controller";

QUnit.module("Sample App controller test");

QUnit.test("The AppController class has a sayHello method", function (assert) {
	// as a very basic test example just check the presence of the "sayHello" method
	assert.strictEqual(typeof MainController.prototype.sayHello, "function");
});

/*global QUnit, sinon*/

sap.ui.define(["ui5/ecosystem/demo/app/controller/Main.controller", "sap/ui/thirdparty/sinon", "sap/ui/thirdparty/sinon-qunit"], function (Controller /*sinon, sinon-qunit*/) {
	"use strict";

	QUnit.module("Main Controller");

	QUnit.test("inits correctly", function (assert) {
		const oAppController = new Controller();
		const oViewStub = sinon.stub(Controller.prototype, "getView").returns({
			setModel: sinon.stub().returns("stubbed"),
		});
		oAppController.onInit();
		oViewStub.restore();
		assert.ok(oAppController);
	});

	QUnit.test("provides fwd nav capability", function (assert) {
		const oAppController = new Controller();
		const oRouterStub = sinon.stub(Controller.prototype, "getOwnerComponent").returns({
			getRouter: sinon.stub().returnsThis(),
			navTo: sinon.stub().returns("stubbed"),
		});
		const stubbedRet = oAppController.navTo("RouteOther");
		oRouterStub.restore();
		assert.strictEqual(stubbedRet, "stubbed");
	});
});

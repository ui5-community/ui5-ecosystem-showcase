/*global QUnit, sinon*/

sap.ui.define([
	"test/Sample/controller/Main.controller",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function (Controller /*sinon, sinon-qunit*/) {
	"use strict";

	QUnit.module("Main Controller");

	QUnit.test("inits correctly", function (assert) {
		const oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

	QUnit.test("provides fwd nav capability", function (assert) {
		const oAppController = new Controller();
		const oRouterStub = sinon.stub(Controller.prototype, "getOwnerComponent").returns({
			getRouter: sinon.stub().returnsThis(),
			navTo: sinon.stub().returns("stubbed")
		});
		const stubbedRet = oAppController.navFwd();
		oRouterStub.restore();
		assert.strictEqual(stubbedRet, "stubbed");
	});

});
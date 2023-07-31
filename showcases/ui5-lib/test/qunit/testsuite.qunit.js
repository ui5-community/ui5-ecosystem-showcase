sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit TestSuite for ui5.ecosystem.demo.lib",
		defaults: {
			bootCore: true,
			ui5: {
				libs: "sap.ui.core,ui5.ecosystem.demo.lib",
				theme: "sap_horizon",
				noConflict: true,
				preload: "auto",
			},
			qunit: {
				version: 2,
				reorder: false,
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimers: false,
			},
			module: "./{name}.qunit",
		},
		tests: {
			// test file for the Example control
			Example: {
				title: "QUnit Test for Example",
				_alternativeTitle: "QUnit tests: ui5.ecosystem.demo.lib.Example",
			},
		},
	};
});

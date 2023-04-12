// regular code of the Thirdparty.controller.js
sap.ui.define(
	[
		"ui5/ecosystem/demo/app/controller/BaseController",
		"xlsx",
		"cmis",
		"ui5-app/bundledefs/firebase", // requires node-fetch@2
		"@supabase/supabase-js",
		"@octokit/core", // requires node-fetch@2
		"axios",
		"@js-temporal/polyfill",
		"@stomp/stompjs",
	],
	(Controller, xlsx, cmis, _firebase, supabase, octokit, axios, temporal, stompjs) => {
		"use strict";

		console.log(xlsx);
		console.log(cmis);
		console.log(_firebase);
		console.log(supabase);
		console.log(octokit);
		console.log(axios);
		console.log(temporal);
		console.log(stompjs);

		const { initializeApp, getFirestore } = _firebase;
		const app = initializeApp({});
		try {
			getFirestore(app);
		} catch (ex) {
			console.error(ex);
		}

		return Controller.extend("ui5.ecosystem.demo.app.controller.Thirdparty", {
			onInit() {
				// https://www.npmjs.com/package/xlsx
				const worksheet = xlsx.utils.aoa_to_sheet([
					["A1", "B1", "C1"],
					["A2", "B2", "C2"],
					["A3", "B3", "C3"],
				]);
				const csv = xlsx.utils.sheet_to_csv(worksheet);
				console.log(worksheet, csv);
			},
		});
	}
);

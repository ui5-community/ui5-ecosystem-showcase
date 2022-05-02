module.exports = function (config) {
	"use strict";

	require("./karma.conf")(config);
	config.set({
		ui5: {
			configPath: "ui5-min.yaml",
		},
		proxies: {
			"/backend": {
				target: "https://services.odata.org/V4/(S(fdng4tbvlxgzpdtpfap2rqss))/TripPinServiceRW",
				changeOrigin: true,
			},
		},
		proxyValidateSSL: false,

		// -- leaving this as a reference
		// preprocessors: {
		//     "{webapp,webapp/!(test)}/*.js": ["coverage"],
		// },
		// coverageReporter: {
		//     includeAllSources: true,
		//     reporters: [
		//         {
		//             type: "text",
		//         },
		//     ],
		//     check: {
		//         each: {
		//             statements: 100,
		//             branches: 100,
		//             functions: 100,
		//             lines: 100,
		//         },
		//     },
		// },
		// reporters: ["progress", "coverage"],
		// -- end coverage reference

		reporters: ["progress"],

		browsers: ["ChromeHeadless"],

		singleRun: true,
	});
};

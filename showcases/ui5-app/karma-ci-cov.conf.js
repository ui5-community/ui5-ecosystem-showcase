module.exports = function (config) {
	require("./karma-ci.conf")(config);
	config.set({
		reporters: ["progress", "coverage"],
		preprocessors: {
			"{webapp,webapp/!(test)}/*.js": ["ui5-transpile"],
		},
		coverageReporter: {
			dir: "coverage",
			includeAllSources: true,
			reporters: [
				{ type: "html", subdir: "report-html" },
				{ type: "cobertura", subdir: ".", file: "cobertura.txt" },
				{ type: "lcovonly", subdir: ".", file: "report-lcovonly.txt" },
				{ type: "text-summary" },
			],
			/*
			check: {
				each: {
					statements: 100,
					branches: 100,
					functions: 100,
					lines: 100,
				},
			},
			*/
		},
	});
};

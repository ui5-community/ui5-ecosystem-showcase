module.exports = function (config) {
	config.set({
		frameworks: ["ui5"],
		browsers: ["Chrome"],
		browserConsoleLogOptions: {
			level: "error",
		},
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
		// Make Karma work with pnpm.
		// See: https://github.com/pnpm/pnpm/issues/720#issuecomment-954120387
		plugins: Object.keys(require("./package").devDependencies)
			.filter((packageName) => {
				return packageName.startsWith("karma-");
			})
			.flatMap((packageName) => {
				return [require(packageName)];
			}),
	});
};

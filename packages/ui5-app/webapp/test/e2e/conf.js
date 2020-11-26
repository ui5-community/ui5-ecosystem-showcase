exports.config = {
    profile: "integration",
    baseUrl: "http://localhost:1081/index.html",
    browsers: [
        {
            browserName: process.env.HEADLESS ? "chromeHeadless" : "chrome"
        }
    ]
};

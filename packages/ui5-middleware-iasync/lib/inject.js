const fs = require("fs");
const injector = require("connect-injector");
const path = require("path");

// read in UI5 "enhancements" that enable syncing click actions
// browsersync only syncs "clicks", but e.g. no "taps"
const customUI5Html = fs.readFileSync(path.join(`${__dirname}`, "ui5mangler.html"), { encoding: "utf-8" });

// mostly directly taken from https://github.com/schmich/connect-browser-sync/blob/master/index.js
module.exports = function injectBrowserSyncAndCustomUI5(browserSync, options = {}) {
    let snippet = "";
    let injectedHtml = customUI5Html + "</body>";
    let find = /<\/body>(?!(.|\n)*<\/body>)/gi;

    browserSync.emitter.on("service:running", (data) => {
        if (!snippet) {
            snippet = data.options.get("snippet");
        }
    });
    return injector(
        (req, res) => {
            let contentType = res.getHeader("content-type");
            return contentType && contentType.toLowerCase().indexOf("text/html") >= 0;
        },
        function converter(content, req, res, callback) {
            function inject() {
                let injected = content.toString().replace(find, snippet + injectedHtml);
                callback(null, injected);
            }
            if (!snippet) {
                // We don't have the snippet from BrowserSync yet.
                // Block the response until we get it.
                browserSync.emitter.on("service:running", function(data) {
                    if (!snippet) {
                        snippet = data.options.get("snippet");
                    }
                    inject();
                });
            } else {
                inject();
            }
        }
    );
}

const browserSync = require("browser-sync");
const log = require("@ui5/logger").getLogger("server:custommiddleware:iasync");

const injector = require("connect-injector");

const customUI5Html = `
<script>
        sap.ui.require([
            "sap/m/Button",
            "sap/ui/unified/calendar/Month",
            "sap/ui/unified/calendar/YearPicker"
        ], (Button, Month, YearPicker) => {

            Button.prototype.onclick = function () {
                Button.prototype.ontap.apply(this, arguments);
            }

            Month.prototype.onclick = function () {
                Month.prototype.onmousedown.apply(this, arguments);
                Month.prototype.onkeydown.apply(this, arguments);
                Month.prototype.onsapselect.apply(this, arguments);
            }
            YearPicker.prototype.onclick = function () {
                YearPicker.prototype.onmousedown.apply(this, arguments);
                YearPicker.prototype.onsapselect.apply(this, arguments);
            }

        });
    </script>
`;

function injectBrowserSync(browserSync, options) {
    var snippet = "";
    var options = options || {};

    if (options.injectHead === true) {
        var tag = customUI5Html + "</head>";
        var find = /<\/head>/gi;
    } else {
        var tag = customUI5Html + "</body>";
        var find = /<\/body>(?!(.|\n)*<\/body>)/gi;
    }

    browserSync.emitter.on("service:running", function(data) {
        if (!snippet) {
            snippet = data.options.get("snippet");
        }
    });

    return injector(
        function(req, res) {
            var contentType = res.getHeader("content-type");
            return contentType && contentType.toLowerCase().indexOf("text/html") >= 0;
        },
        function converter(content, req, res, callback) {
            function inject() {
                var injected = content.toString().replace(find, snippet + tag);
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
/**
 * Custom UI5 Server middleware example
 *
 * @param {Object} parameters Parameters
 * @param {Object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {Object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {function} Middleware function to use
 */
module.exports = function({ resources, options }) {
    const bs = browserSync.create().init(
        {
            socket: {
                domain: "localhost:3000"
            },
            host: "localhost:3000",
            logSnippet: false,
            notify: false
        },
        (err, instance) => {
            log.info(`started`);
        }
    );
    // return (req, res, next) => {
    // const ret = require("connect-browser-sync")(bs);
    const ret = injectBrowserSync(bs);
    return ret;
    // }
};

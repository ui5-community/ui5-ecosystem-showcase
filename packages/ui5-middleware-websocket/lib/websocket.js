const hook = require("ui5-utils-express/lib/hook");
const expressws = require("./expressws");

/**
 * Middleware callback function to handle the WebSocket request
 *
 * @callback WSMiddlewareFunction
 * @param {WebSocket} ws websocket object
 * @param {Express.Request} req express request object
 * @param {Function} next function to trigger the next middleware
 * @returns {void}
 */

/**
 * Function to inject a WebSocket middleware function into an Express middleware.
 *
 * @param {WSMiddlewareFunction} middleware the websocket middleware function to wrap
 * @returns {Function} Middleware function for the UI5 CLI
 */
module.exports = function websocket(middleware) {
	return hook(middleware.name || "generic-ui5-middleware-websocket", ({ app, server, options }) => {
		// enhance the express server for websocket support
		expressws(app, server);
		// register the mountpath or the root path if no mountpath is defined
		app.ws(options.mountpath || "/", function (/*ws, req, next */) {
			middleware.apply(this, arguments);
		});
	});
};

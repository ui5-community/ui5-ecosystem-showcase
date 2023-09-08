// INSPIRED BY: https://github.com/HenningM/express-ws

const http = require("http");
const { Server: WebSocketServer } = require("ws");

// eslint-disable-next-line jsdoc/require-jsdoc
function suffixWsPath(path) {
	const url = new URL(path.replace(/(\/+)$/, "") + "/.ws", "ws://localhost");
	return `${url.pathname}${url.search}`;
}

// eslint-disable-next-line jsdoc/require-jsdoc
function wrapMiddleware(middleware) {
	return (req, res, next) => {
		if (req.ws != null) {
			// request is a websocket request => delegate
			middleware(req.ws, req, next);
			req.ws._handled = true;
		} else {
			// no websocket request => ignore
			next();
		}
	};
}

// eslint-disable-next-line jsdoc/require-jsdoc
function createWebSocketServer(app, server) {
	// install the handler
	const wss = new WebSocketServer({ noServer: true });
	server.on(
		"upgrade",
		function upgrade(req, socket, head) {
			const { wssRoutes } = this["ui5-middleware-websocket"];
			const pathname = suffixWsPath(req.url?.match("^[^?]*")[0]);
			if (wssRoutes.indexOf(pathname) !== -1) {
				wss.handleUpgrade(req, socket, head, function done(ws) {
					// emit the connection event
					wss.emit("connection", ws, req);
					// send a dummy request
					sendDummyRequest(app, req, ws);
				});
			}
			/*
		} else {
			socket.destroy();
		}
		*/
		}.bind(app)
	);
	return wss;
}

// eslint-disable-next-line jsdoc/require-jsdoc
function sendDummyRequest(app, req, socket) {
	// add the websocket to the request
	req.ws = socket;
	req.ws._handled = false;
	// the fake url delegates the request to the fake GET handler we used to register
	// the middleware functions which take unpack the websocket again from the request
	req["ui5-middleware-websocket"] = {
		url: req.url,
	};
	req.url = suffixWsPath(req.url);
	// let express validate whether the websocket works or not
	const res = new http.ServerResponse(req);
	app.handle(req, res, (err) => {
		// if the request wasn't handled as websocket there must be an error
		if (err) {
			throw err;
		} else if (!req.ws?._handled) {
			socket.close();
		}
	});
}

/**
 * Middleware callback function to handle the websocket request
 *
 * @callback WSMiddlewareFunction
 * @param {WebSocket} ws websocket object
 * @param {Express.Request} req express request object
 * @param {function} next function to trigger the next middleware
 * @returns {void}
 */

/**
 * Routes websocket requests to the specified path with the specified callback functions.
 *
 * @param {string} path
 * @param  {...WSMiddlewareFunction} middlewares middleware callback functions
 * @returns
 */
function wsRoute(path, ...middlewares) {
	const wrappedMiddlewares = middlewares.flat().map(wrapMiddleware);
	// add a suffix to identify the router again and use the express server
	// for the routing and the error handling (reuse as much as possible!!)
	const wsPath = suffixWsPath(path);
	// register the route to know which one should be handled by the WebSocketServer
	this["ui5-middleware-websocket"].wssRoutes.push(wsPath);
	// create a GET router for internal usage only to reuse express functionality
	this.get(wsPath, ...wrappedMiddlewares);
	// the usual express chaining support ;-)
	return this;
}

/**
 * Enhances an Express application to support WebSockets by adding
 * a WebSocketServer and adding a custom `ws` function which allows
 * to register custom routes for WebSockets to the Express app.
 *
 * @param {Express.Application} app the express application
 * @param {http.Server} server the http server instance
 * @param {object} options some options
 * @returns {void}
 */
module.exports = function expressws(app, server /*, options = {} */) {
	if (app.ws == null) {
		// create an own server if not provided
		if (!server) {
			server = http.createServer(app);
			app.listen = function serverListen(...args) {
				return server.listen(...args);
			};
		}
		// store the reference to the WebSocketServer
		app["ui5-middleware-websocket"] = {
			wss: createWebSocketServer(app, server),
			wssRoutes: [], // filled by wsRoute function
		};
		// install the custom ws function on the app instance
		app.ws = wsRoute;
	} else {
		throw new Error("Express application has been upgraded for WebSocket support already!");
	}
};

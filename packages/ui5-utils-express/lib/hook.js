/* ------------------------------------------------------------------------- *
 *     .----..-.    .--.  .---..-. .-.   .-.   .-. .--.  .---..-..---.       *
 *     | {}  | |   / {} \/  ___| |/ /    |  `.'  |/ {} \/   __| /  ___}      *
 *     | {}  | `--/  /\  \     | |\ \    | |\ /| /  /\  \  {_ | \     }      *
 *     `----'`----`-'  `-'`---'`-' `-'   `-' ` `-`-'  `-'`---'`-'`---'       *
 *                        PROVIDED BY PETER MUESSIG                          *
 *   .-. .-..----.    .-. . .-. .--. .----..----.  .--. .-. .-..---.-.  .-.  *
 *   |  `| /  {}  \   | |/ \| |/ {} \| {}  | {}  }/ {} \|  `| {_   _\ \/ /   *
 *   | |\  \      /   |  .'.  /  /\  | .-. | .-. /  /\  | |\  | | |  }  {    *
 *   `-' `-'`----'    `-'   `-`-'  `-`-' `-`-' `-`-'  `-`-' `-' `-'  `--'    *
 *                          USE AT YOUR OWN RISK!                            *
 * ------------------------------------------------------------------------- */
// Created with the text ASCII art generator https://patorjk.com/software/taag/
//   => #p=display&h=3&f=JS%20Bracket%20Letters&t=BLACK%20MAGIC%0ANO%20WARRANTY

// eslint-disable-next-line no-unused-vars
const http = require("http"); // needed for JSDoc

/**
 * Callback function to inform when the server is listening which provides access to
 * the server instance and the express app.
 *
 * @callback ServerListenCallback
 * @param {object} parameters the callback parameters
 * @param {Express.Application} parameters.app the express application
 * @param {http.Server} parameters.server the http server instance
 * @param {Function} parameters.on function to register event handlers for the server which raise only if the mountpath matches
 * @param {object} parameters.options some options
 * @param {string} parameters.options.mountpath mount path of the middleware function
 * @param {string} [parameters.options.host] host the server is listening on
 * @param {number} [parameters.options.port] port the server is listening to
 * @returns {void}
 */

/**
 * Middleware callback function to handle the request
 *
 * @callback MiddlewareFunction
 * @param {Express.Request} req express request object
 * @param {Express.Response} res express response object
 * @param {Function} next function to trigger the next middleware
 * @returns {void}
 */

/**
 * This function installs an express app-like middleware function
 * to get access to the express app and intercepts the listen function
 * to get access to the server instance.
 *
 * @param {string} name name of the middleware function
 * @param {ServerListenCallback} callback callback function when the middleware has been mounted and the server is listening
 * @param {MiddlewareFunction} [middleware] optional middleware function which is called to handle the request
 * @returns {Function} Middleware function to use
 */
module.exports = function hook(name, callback, middleware) {
	// default the name
	name = name || "<anonymous_hook>";
	// simulate a non-express app to get access to the app!
	if (typeof callback === "function") {
		// when used inside a router, the hook can be only
		// initialized with the first request for this route
		let initializedByRouter = false;
		const fn = async function (req, res, next) {
			if (!initializedByRouter) {
				const app = req.app;
				// the server is usually derived from the app except in the
				// approuter scenario, there we need to do the lookup at the
				// approuter property in the app propery at the request
				const server = app?.server || app?.approuter?._server?._server;
				if (app && server) {
					await callback({
						app,
						server,
						on: server.on.bind(server),
						use: app.use.bind(app),
						options: {
							mountpath: `${req["ui5-patched-router"]?.baseUrl || ""}/`,
						},
					});
				} else {
					console.error(
						`\x1b[36m[~~hook<${name}>~~]\x1b[0m \x1b[31m[ERROR]\x1b[0m - Failed to hook into current server (most likely you are running a connect server which isn't supported by this hook)!`,
					);
				}
				initializedByRouter = true;
			}
			next();
		};
		// when embedding inside the express application, we simulate
		// an express application function which is being called back
		// with the application and server information when mounted
		Object.defineProperty(fn, "name", {
			value: name,
			writable: false,
		});
		Object.assign(fn, {
			handle: function handle(req, res, next) {
				if (typeof middleware === "function") {
					middleware.apply(this, arguments);
				} else {
					next(); // ignore requests, just delegate
				}
			},
			set: () => {
				/* noop! */
			},
			emit: (event, app) => {
				// intercept the mount event to get access to the app
				if (event === "mount") {
					// store the position into which new custom middlewares should
					// be placed into when using the "use" function of the callback
					const middlewareIndex = app?._router?.stack?.length;
					// intercept the listen call to get access to the server
					const { listen } = app;
					app.listen = function () {
						const server = listen.apply(this, arguments);
						const options =
							typeof arguments[0] === "object"
								? arguments[0]
								: {
										host: typeof arguments[0] === "number" ? arguments[1] : undefined,
										port: typeof arguments[0] === "number" ? arguments[0] : undefined,
									};
						options.mountpath = fn.mountpath;
						//options.parent = fn.parent;
						callback({
							app: this,
							server,
							on: server.on.bind(server),
							use: function use() {
								app.use.apply(app, arguments);
								// move the middleware function just after the mounted
								// express app in the middleware stack to ensure proper
								// order and execution in the middleware chain!
								if (middlewareIndex != null && middlewareIndex !== -1) {
									const middlewareStack = app?._router?.stack;
									const cmw = middlewareStack.pop();
									middlewareStack.splice(middlewareIndex, 0, cmw);
								}
								return app;
							},
							options,
						});
						return server;
					};
				}
			},
		});
		return fn;
	} else {
		return async function (req, res, next) {
			/* dummy middleware function */ next();
		};
	}
};

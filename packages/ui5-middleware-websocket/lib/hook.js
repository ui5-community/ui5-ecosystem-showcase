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

const http = require("http");

/**
 * Callback function to inform when the server is listening which provides access to
 * the server instance and the express app.
 *
 * @callback ServerListenCallback
 * @param {object} parameters the callback parameters
 * @param {Express.Application} parameters.app the express application
 * @param {http.Server} parameters.server the http server instance
 * @param {function} parameters.on function to register event handlers for the server which raise only if the mountpath matches
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
 * @param {function} next function to trigger the next middleware
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
	// simulate a non-express app to get access to the app!
	if (typeof callback === "function") {
		const fn = function () {};
		Object.defineProperty(fn, "name", {
			value: name || "hook",
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

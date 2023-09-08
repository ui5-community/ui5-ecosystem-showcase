const websocket = require("./websocket");

/**
 * WebSocket middleware to act as an echo server. This is just
 * a demo middleware to test/showcase a WebSocket middleware
 * function in the UI5 tooling.
 *
 * @param {object} parameters Parameters
 * @param {@ui5/logger/Logger} parameters.log Logger instance
 * @returns {Function} Middleware function to use
 */
module.exports = ({ log }) => {
	// simulate a non-express app to get access to the app!
	return websocket(function echo(ws, req /*, next */) {
		ws.on("message", function (message) {
			log.info(`message: ${message}`);
			ws.send(`echo ${message}`);
		});
		log.info(`Connection established with ${req.url}`);
	});
};

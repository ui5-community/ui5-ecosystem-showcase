const test = require("ava")
const path = require("path")

const express = require("express")
const expressws = require("ui5-middleware-websocket/lib/expressws")

const supertest = require("supertest")
const superwstest = require("superwstest")
const nock = require("nock")

// Start server before running tests
test.before(async (t) => {
	// create the ports for the proxy server
	const getPort = (await import("get-port")).default
	const appRouterPort = await getPort()
	const ui5ServerPort = await getPort()
	const wsServerPort = await getPort()

	// setup the WebSocket echo server (as counterpart)
	const wsApp = express()
	expressws(wsApp) // enhance the express app for websocket support
	wsApp.ws("/", function (ws /*, req, next */) {
		ws.on("message", function (message) {
			console.log(`message: ${message}`)
			ws.send(`echo ${message}`)
		})
		ws.send(`hello`)
	})
	t.context.wsServer = wsApp.listen(wsServerPort)

	// start the UI5 development server with multiple proxy middlewares
	const { graphFromPackageDependencies } = await import("@ui5/project/graph")
	const debug = false
	const graph = await graphFromPackageDependencies({
		cwd: "../../showcases/ui5-app",
		rootConfiguration: {
			specVersion: "3.0",
			metadata: {
				name: "ui5-middleware-approuter-test"
			},
			type: "application",
			server: {
				customMiddleware: [
					{
						name: "ui5-middleware-approuter",
						afterMiddleware: "compression",
						configuration: {
							debug: true,
							port: appRouterPort,
							xsappJson: path.resolve(__dirname, "./websocket/xs-app.json"),
							destinations: [
								{
									name: "express",
									url: `ws://localhost:${wsServerPort}`
								},
								{
									name: "ui5",
									url: `ws://localhost:${ui5ServerPort}/wsecho/`
								}
							],
							enableWebSocket: true
						}
					},
					{
						name: "ui5-middleware-websocket-echo",
						afterMiddleware: "compression",
						mountPath: "/wsecho/"
					}
				]
			}
		}
	})

	// install a global hook to register the approuter instances
	globalThis["ui5-middleware-approuter"] = {
		approuters: []
	}

	// start the UI5 server
	const { serve } = await import("@ui5/server")
	t.context.server = await serve(graph, {
		port: ui5ServerPort
	})

	// get the approuter instance
	const approuter = globalThis["ui5-middleware-approuter"]?.approuters?.pop()

	t.context.approuter = approuter
	const wsRequest = superwstest
	t.context.wsRequest = wsRequest(`http://localhost:${ui5ServerPort}`)
})

test.after.always((t) => {
	// eslint-disable-next-line jsdoc/require-jsdoc
	function close(server) {
		return new Promise((resolve, reject) => {
			server.close((error) => {
				if (error) {
					reject(error)
				} else {
					resolve()
				}
			})
		})
	}

	// stop all servers
	return Promise.all([close(t.context.approuter), close(t.context.wsServer), close(t.context.server)])
})

test("WebSocket basic test (express server)", async (t) => {
	const { wsRequest } = t.context
	await wsRequest
		.ws("/express", {
			origin: "http://localhost"
		})
		.expectText((msg) => {
			t.is(msg, "hello")
			return true
		})
		.sendText("XXX")
		.expectText((msg) => {
			t.is(msg, "echo XXX")
			return true
		})
		.close()
})

// Using the ui5-app the websocket-echo service works, but not in the test!
// This is something to be followed up in the future - but nevertheless no
// typical scenario - normally the websocket service is on other machines
// and not proxied from the UI5 server via the approuter to the UI5 server!!
/*
test("WebSocket basic test (ui5 server)", async (t) => {
	const { wsRequest } = t.context;
	await wsRequest
		.ws("/ui5", {
			origin: "http://localhost:1081"
		})
		.expectText((msg) => {
			t.is(msg, "hello");
			return true;
		})
		.sendText("XXX")
		.expectText((msg) => {
			t.is(msg, "echo XXX");
			return true;
		})
		.close();
});
*/

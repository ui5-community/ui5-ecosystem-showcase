const test = require("ava");

const express = require("express");
const { createProxyMiddleware, responseInterceptor } = require("http-proxy-middleware");
const expressws = require("ui5-middleware-websocket/lib/expressws");
const querystring = require("querystring");

const supertest = require("supertest");
const superwstest = require("superwstest");
const nock = require("nock");
const proxy = require("node-tcp-proxy");

let proxyServerHitCount = 0;

// Start server before running tests
test.before(async (t) => {
	// create the ports for the proxy server
	const getPort = (await import("get-port")).default;
	const proxyServerPort = await getPort();
	const wsServerPort = await getPort();
	const wsProxyServerPort = await getPort();

	// define environment variables
	//process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
	process.env.HTTP_PROXY = `http://localhost:${proxyServerPort}`;
	process.env.NO_PROXY = `secure.example.com,localhost`;

	// setup the corporate proxy server (simulate close function)
	const proxyServer = (t.context.proxyServer = proxy.createProxy(proxyServerPort, "corporate-proxy", 80, {
		upstream: function (context, data) {
			//const { remoteAddress, remotePort } = context.proxySocket;
			//console.log(`[PROXY] Client ${remoteAddress}:${remotePort}: ${data}`);
			proxyServerHitCount++;
			// do something with the data and return modified data
			return data;
		},
		downstream: function (context, data) {
			//const { remoteAddress, remotePort } = context.serviceSocket;
			//console.log(`[PROXY] Service ${remoteAddress}:${remotePort}: ${data}`);
			// do something with the data and return modified data
			return data;
		},
	}));
	t.context.proxyServer.close = function (cb) {
		proxyServer.end();
		cb();
	};

	// setup the WebSocket echo server (as counterpart)
	const wsApp = express();
	expressws(wsApp); // enhance the express app for websocket support
	wsApp.ws("/", function (ws /*, req, next */) {
		ws.on("message", function (message) {
			console.log(`message: ${message}`);
			ws.send(`echo ${message}`);
		});
		ws.send(`hello`);
	});
	t.context.wsServer = wsApp.listen(wsServerPort);

	// setup a standard express proxy server using the default
	// http-proxy-middleware plus the WebSocket extension
	const app = express();
	const wsProxy = createProxyMiddleware({
		target: `ws://localhost:${wsServerPort}`,
		changeOrigin: true,
		autoRewrite: true,
		xfwd: true,
		secure: false,
		pathRewrite: {
			"^/ws": "/",
		},
		selfHandleResponse: true,
		onProxyRes: responseInterceptor(async (responseBuffer /*, proxyRes, req, res */) => {
			return responseBuffer;
		}),
	});
	app.use("/ws", wsProxy);
	const testserver = (t.context.wsProxyServer = app.listen(wsProxyServerPort));
	testserver.on("upgrade", wsProxy.upgrade);

	// start the UI5 development server with multiple proxy middlewares
	const { graphFromPackageDependencies } = await import("@ui5/project/graph");
	const debug = false;
	const graph = await graphFromPackageDependencies({
		cwd: "../../showcases/ui5-app",
		rootConfiguration: {
			specVersion: "3.0",
			metadata: {
				name: "ui5-middleware-simpleproxy-test",
			},
			type: "application",
			server: {
				customMiddleware: [
					{
						name: "ui5-middleware-simpleproxy",
						mountPath: "/local",
						afterMiddleware: "compression",
						configuration: {
							debug,
							baseUri: `http://www.example.com`,
						},
					},
					{
						name: "ui5-middleware-simpleproxy",
						mountPath: "/local-ssl",
						afterMiddleware: "compression",
						configuration: {
							debug,
							baseUri: `https://secure.example.com`,
							strictSSL: false,
						},
					},
					{
						name: "ui5-middleware-simpleproxy",
						mountPath: "/local-subpath",
						afterMiddleware: "compression",
						configuration: {
							debug,
							baseUri: `http://www.example.com/subpath`,
						},
					},
					{
						name: "ui5-middleware-simpleproxy",
						mountPath: "/proxy",
						afterMiddleware: "compression",
						configuration: {
							debug,
							baseUri: `http://www.example.com`,
							httpHeaders: {
								"Any-Header": "AnyHeader",
							},
							query: {
								"any-boolean-param": true,
								"any-number-param": 1337,
								"any-string-param": "test#🚀",
							},
							excludePatterns: ["/local/**"],
							removeETag: true,
							username: "xxx",
							password: "yyy",
							skipCache: true,
						},
					},
					{
						name: "ui5-middleware-simpleproxy",
						mountPath: "/corporate-proxy",
						afterMiddleware: "compression",
						configuration: {
							debug,
							baseUri: `http://corporate-proxy`,
						},
					},
					{
						name: "ui5-middleware-simpleproxy",
						mountPath: "/ws",
						afterMiddleware: "compression",
						configuration: {
							debug: true,
							baseUri: `http://localhost:${wsServerPort}`,
							enableWebSocket: true,
						},
					},
					{
						name: "ui5-middleware-websocket-echo",
						afterMiddleware: "compression",
						mountPath: "/otherws",
					},
				],
			},
		},
	});

	// start the UI5 server
	const ui5ServerPort = await getPort();
	const { serve } = await import("@ui5/server");
	t.context.server = await serve(graph, {
		port: ui5ServerPort,
	});
	const request = supertest,
		wsRequest = superwstest;
	t.context.request = request(`http://localhost:${ui5ServerPort}`);
	t.context.wsRequest = wsRequest(`http://localhost:${ui5ServerPort}`);
	t.context.wsProxyRequest = wsRequest(`http://localhost:${wsProxyServerPort}`);
});

test.after.always((t) => {
	// eslint-disable-next-line jsdoc/require-jsdoc
	function close(server) {
		return new Promise((resolve, reject) => {
			server.close((error) => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
	}

	// stop all servers
	return Promise.all([close(t.context.proxyServer), close(t.context.wsProxyServer), close(t.context.wsServer), close(t.context.server)]);
});

test("HTTP basic test", async (t) => {
	nock("http://www.example.com/")
		.get("/debug.json")
		.reply(
			200,
			function (/*uri, requestBody*/) {
				return JSON.stringify({
					headers: { ...this.req.headers },
				});
			},
			{
				"content-type": "application/json",
				etag: `W/"DummyETag"`,
			}
		);

	const { request } = t.context;
	const res = await request.get("/local/debug.json");
	if (res.error) {
		throw res.error;
	}
	t.is(res.statusCode, 200, "Correct HTTP status code");
	t.regex(res.headers["content-type"], /json/, "Correct content type");
	t.is(res.headers["etag"], `W/"DummyETag"`, "ETag available");
	t.not(res.body["headers"]["authorization"], "No Authorization Header");
	t.not(res.body["headers"]["any-header"], "No Custom Header");
	t.is(res.body["headers"]["host"], "www.example.com", "Host header changed");
});

test("HTTPS basic test", async (t) => {
	nock("https://secure.example.com")
		.get("/debug.json")
		.reply(
			200,
			function (/*uri, requestBody*/) {
				return JSON.stringify({
					headers: { ...this.req.headers },
				});
			},
			{
				"content-type": "application/json",
				etag: `W/"DummyETag"`,
			}
		);

	const { request } = t.context;
	const res = await request.get("/local-ssl/debug.json");
	if (res.error) {
		throw res.error;
	}
	t.is(res.statusCode, 200, "Correct HTTP status code");
	t.regex(res.headers["content-type"], /json/, "Correct content type");
	t.is(res.headers["etag"], `W/"DummyETag"`, "ETag available");
	t.not(res.body["headers"]["authorization"], "No Authorization Header");
	t.not(res.body["headers"]["any-header"], "No Custom Header");
	t.is(res.body["headers"]["host"], "secure.example.com", "Host header changed");
});

test("HTTP subpath test", async (t) => {
	nock("http://www.example.com")
		.get("/subpath/debug.json")
		.reply(
			200,
			function (/*uri, requestBody*/) {
				return JSON.stringify({
					headers: { ...this.req.headers },
				});
			},
			{
				"content-type": "application/json",
				etag: `W/"DummyETag"`,
			}
		);

	const { request } = t.context;
	const res = await request.get("/local-subpath/debug.json");
	if (res.error) {
		throw res.error;
	}
	t.is(res.statusCode, 200, "Correct HTTP status code");
	t.regex(res.headers["content-type"], /json/, "Correct content type");
	t.is(res.headers["etag"], `W/"DummyETag"`, "ETag available");
	t.not(res.body["headers"]["authorization"], "No Authorization Header");
	t.not(res.body["headers"]["any-header"], "No Custom Header");
	t.is(res.body["headers"]["host"], "www.example.com", "Host header changed");
});

test("HTTPS cookie test", async (t) => {
	nock("https://secure.example.com")
		.get("/cookie.txt")
		.reply(
			200,
			function (/*uri, requestBody*/) {
				return "Cookie Alert!";
			},
			{
				"set-cookie": [
					"<cookie-name>=<cookie-value>",
					"<cookie-name>=<cookie-value>; Domain=<domain-value>",
					"<cookie-name>=<cookie-value>; Expires=<date>",
					"<cookie-name>=<cookie-value>; HttpOnly",
					"<cookie-name>=<cookie-value>; Max-Age=<number>",
					"<cookie-name>=<cookie-value>; Partitioned",
					"<cookie-name>=<cookie-value>; Path=<path-value>",
					"<cookie-name>=<cookie-value>; Secure",
					"<cookie-name>=<cookie-value>; SameSite=Strict",
					"<cookie-name>=<cookie-value>; SameSite=Lax",
					"<cookie-name>=<cookie-value>; SameSite=None; Secure",
					"<cookie-name>=<cookie-value>; Domain=<domain-value>; Secure; HttpOnly",
				],
				"content-type": "text/plain",
			}
		);

	const { request } = t.context;
	const res = await request.get("/local-ssl/cookie.txt");
	if (res.error) {
		throw res.error;
	}
	t.is(res.statusCode, 200, "Correct HTTP status code");
	t.regex(res.headers["content-type"], /text/, "Correct content type");
	t.regex(res.text, /Cookie Alert!/, "Correct text");
	t.is(
		res.headers["set-cookie"].some((cookie) => {
			return /(secure|domain|path|samesite)/gi.test(cookie);
		}),
		false,
		"All cookies are unsecured!"
	);
});

test("Configuration options", async (t) => {
	nock("http://www.example.com")
		.get("/debug.json")
		.query(true)
		.reply(
			200,
			function (/*uri, requestBody*/) {
				const parsed = new URL(this.req.path, "http://www.example.com");
				return JSON.stringify({
					headers: { ...this.req.headers },
					query: { ...querystring.parse(parsed.search.substring(1)) },
				});
			},
			{
				"content-type": "application/json",
				etag: `W/"DummyETag"`,
			}
		);

	const { request } = t.context;
	const res = await request.get("/proxy/debug.json");
	if (res.error) {
		throw res.error;
	}
	t.is(res.statusCode, 200, "Correct HTTP status code");
	t.regex(res.headers["content-type"], /json/, "Correct content type");
	t.not(res.headers["etag"], `W/"DummyETag"`, "ETag available");
	t.is(res.body["headers"]["authorization"], `Basic ${Buffer.from(`xxx:yyy`).toString("base64")}`, "Correct Authorization Header");
	t.is(res.body["headers"]["any-header"], "AnyHeader", "Correct Custom Header");
	t.is(res.body["query"]["any-boolean-param"], "true", "Correct Boolean Query Parameter");
	t.is(res.body["query"]["any-number-param"], "1337", "Correct Number Query Parameter");
	t.is(res.body["query"]["any-string-param"], "test#🚀", "Correct String Query Parameter");
});

test("excludePatterns option", async (t) => {
	const { request } = t.context;
	const res = await request.get("/proxy/local/hello.txt");
	if (res.error) {
		throw res.error;
	}
	t.is(res.statusCode, 200, "Correct HTTP status code");
	t.regex(res.headers["content-type"], /text/, "Correct content type");
	t.regex(res.text, /Hello World/, "Correct response");
});

test("skipCache option", async (t) => {
	const { request } = t.context;
	const res = await request.get("/proxy/local/~1234567890~b/hello.txt");
	if (res.error) {
		throw res.error;
	}
	t.is(res.statusCode, 200, "Correct HTTP status code");
	t.regex(res.headers["content-type"], /text/, "Correct content type");
	t.regex(res.text, /Hello World/, "Correct response");
	// check to only rewrite FLP urls
	const resError = await request.get("/proxy/local/~1234567890~/hello.txt");
	t.is(resError.statusCode, 404, "Correct HTTP status code");
});

test("Check corporate proxy setup", async (t) => {
	const { request } = t.context;
	await request.get("/corporate-proxy/proxy.txt");
	t.is(proxyServerHitCount, 1, "Proxy server was hit!");
	await request.get("/local-ssl/proxy.txt");
	t.is(proxyServerHitCount, 1, "Proxy server was not hit!");
	await request.get("/corporate-proxy/proxy.txt");
	t.is(proxyServerHitCount, 2, "Proxy server was hit!");
});

test("CRUD operations", async (t) => {
	const { request } = t.context;

	// GET
	nock("http://www.example.com").get("/DataService").reply(
		200,
		{
			key: "value",
		},
		{
			"content-type": "application/json",
		}
	);
	const resGET = await request.get("/local/DataService");
	if (resGET.error) {
		throw resGET.error;
	}
	t.is(resGET.statusCode, 200, "Correct HTTP status code");
	t.regex(resGET.headers["content-type"], /json/, "Correct content type");
	t.is(resGET.body.key, "value", "Correct content");

	// POST
	nock("http://www.example.com").post("/DataService").reply(
		201,
		{
			key: "value",
		},
		{
			"content-type": "application/json",
		}
	);
	const resPOST = await request.post("/local/DataService");
	if (resPOST.error) {
		throw resPOST.error;
	}
	t.is(resPOST.statusCode, 201, "Correct HTTP status code");
	t.regex(resPOST.headers["content-type"], /json/, "Correct content type");
	t.is(resPOST.body.key, "value", "Correct content");

	// PUT
	nock("http://www.example.com").put("/DataService").reply(
		200,
		{
			key: "value",
		},
		{
			"content-type": "application/json",
		}
	);
	const resPUT = await request.put("/local/DataService");
	if (resPUT.error) {
		throw resPUT.error;
	}
	t.is(resPUT.statusCode, 200, "Correct HTTP status code");
	t.regex(resPUT.headers["content-type"], /json/, "Correct content type");
	t.is(resPUT.body.key, "value", "Correct content");

	// PATCH
	nock("http://www.example.com").patch("/DataService").reply(204);
	const resPATCH = await request.patch("/local/DataService");
	if (resPATCH.error) {
		throw resPATCH.error;
	}
	t.is(resPATCH.statusCode, 204, "Correct HTTP status code");

	// DELETE
	nock("http://www.example.com").delete("/DataService").reply(204);
	const resDELETE = await request.delete("/local/DataService");
	if (resDELETE.error) {
		throw resDELETE.error;
	}
	t.is(resDELETE.statusCode, 204, "Correct HTTP status code");
});

test("WebSocket basic test (plain http-proxy-middleware)", async (t) => {
	const { wsProxyRequest } = t.context;
	await wsProxyRequest
		.ws("/ws")
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

test("WebSocket basic test (ui5-middleware-simpleproxy)", async (t) => {
	const { wsRequest } = t.context;
	await wsRequest
		.ws("/ws")
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

test("WebSocket basic test (ui5-middleware-websocket)", async (t) => {
	const { wsRequest } = t.context;
	await wsRequest
		.ws("/otherws")
		.wait(500)
		.sendText("XXX")
		.expectText((msg) => {
			t.is(msg, "echo XXX");
			return true;
		})
		.close();
});

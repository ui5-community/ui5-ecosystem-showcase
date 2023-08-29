const test = require("ava");

const querystring = require("querystring");

const supertest = require("supertest");
const nock = require("nock");
const proxy = require("node-tcp-proxy");

let proxyServerHitCount = 0;

// Start server before running tests
test.before(async (t) => {
	// create the ports for the proxy server
	const getPort = (await import("get-port")).default;
	const proxyServerPort = await getPort();

	// define environment variables
	//process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
	process.env.HTTP_PROXY = `http://localhost:${proxyServerPort}`;
	process.env.NO_PROXY = `secure.example.com,localhost`;

	// setup the corporate proxy server (simulate close function)
	const proxyServer = (t.context.proxyServer = proxy.createProxy(proxyServerPort, "corporate-proxy", 80, {
		upstream: function (context, data) {
			const { remoteAddress, remotePort } = context.proxySocket;
			console.log(`[PROXY] Client ${remoteAddress}:${remotePort}: ${data}`);
			proxyServerHitCount++;
			// do something with the data and return modified data
			return data;
		},
		downstream: function (context, data) {
			const { remoteAddress, remotePort } = context.serviceSocket;
			console.log(`[PROXY] Service ${remoteAddress}:${remotePort}: ${data}`);
			// do something with the data and return modified data
			return data;
		},
	}));
	t.context.proxyServer.close = function (cb) {
		proxyServer.end();
		cb();
	};

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
	t.context.request = supertest(`http://localhost:${ui5ServerPort}`);
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
	return Promise.all([
		close(t.context.server),
		//close(t.context.proxyServer)
	]);
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

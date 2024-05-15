const crypto = require("crypto")
const fs = require("fs-extra")
const nock = require("nock")
const path = require("path")
const request = require("supertest")
const { spawn } = require("child_process")
const test = require("ava")
const waitOn = require("wait-on")

const copyUI5app = require("./_fs_app_util")
const prepUI5ServerConfig = require("./_prep_server_util")

test.beforeEach(async (t) => {
	// copy ui5 app to a temp dir in test folder scope
	t.context.tmpDir = path.resolve(`./test/_ui5-app/${crypto.randomBytes(5).toString("hex")}`)
	await copyUI5app(t.context.tmpDir)

	// dynamic port allocation for ui5 serve
	const getPort = (await import("get-port")).default
	t.context.port = {
		ui5Server: await getPort(),
		appRouter: await getPort()
	}
})

test.afterEach.always(async (t) => {
	// cleanup
	await fs.remove(t.context.tmpDir)
})

test("no auth in yaml, no xsuaa auth in route -> route is unprotected", async (t) => {
	const { ui5 } = await prepUI5ServerConfig({
		ui5Yaml: "./test/no-auth/ui5.yaml",
		appRouterPort: t.context.port.appRouter,
		xsAppJson: "./test/no-auth/xs-app.json",
		tmpDir: t.context.tmpDir
	})

	// start ui5-app with modified route(s) and config
	const child = spawn(`ui5 serve --port ${t.context.port.ui5Server} --config ${ui5.yaml}`, {
		// stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: t.context.tmpDir,
		detached: true // this for being able to kill all subprocesses of above `ui5 serve` later
	})

	// wait for ui5 server and app router to boot
	await waitOn({ resources: [`tcp:${t.context.port.ui5Server}`, `tcp:${t.context.port.appRouter}`] })

	const app = request(`http://localhost:${t.context.port.ui5Server}`)
	// test for the app being started correctly
	const responseIndex = await app.get("/index.html")
	t.is(responseIndex.status, 200, "http 200 on index")

	// backend resource is accessible w/o authentication
	const responseNoAuth = await app.get("/backend/")
	t.is(responseNoAuth.status, 200)
	t.true(responseNoAuth.body.value.length >= 1, "one or more odata entities received")

	// kill all processes that are in the same pid group (see detached: true)
	process.kill(-child.pid)
})

/**
 * expected result: redirect to idp for route /backend
 */
test("auth in yaml, xsuaa auth in route -> route is protected", async (t) => {
	const { ui5 } = await prepUI5ServerConfig({
		ui5Yaml: "./test/auth/ui5-auth-in-yaml.yaml",
		appRouterPort: t.context.port.appRouter,
		xsAppJson: "./test/auth/xs-app.json",
		defaultEnvJson: "./test/auth/default-env.json",
		tmpDir: t.context.tmpDir
	})

	// start ui5-app with modified route(s) and config
	const child = spawn(`ui5 serve --port ${t.context.port.ui5Server} --config ${ui5.yaml}`, {
		// stdio: 'inherit', // > don't include stdout in test output
		shell: true,
		cwd: t.context.tmpDir,
		detached: true // this for being able to kill all subprocesses of above `ui5 serve` later
	})

	// wait for ui5 server and app router to boot
	await waitOn({ resources: [`tcp:${t.context.port.ui5Server}`, `tcp:${t.context.port.appRouter}`] })

	const app = request(`http://localhost:${t.context.port.ui5Server}`)
	// test for the app being started correctly
	const responseIndex = await app.get("/index.html")
	t.is(responseIndex.status, 200, "http 200 on index")

	// test for the redirect reponse to
	// include code for client-side redirect to idp
	const responseIdpRedirect = await app.get("/backend/")
	t.is(responseIdpRedirect.status, 200)
	t.true(
		responseIdpRedirect.text.includes("https://authentication.eu10.hana.ondemand.com/oauth/authorize"),
		"oauth endpoint redirect injected"
	)

	// kill all processes that are in the same pid group (see detached: true)
	process.kill(-child.pid)
})

/**
 * even though "authenticationMethod": "route" is set in xs-app.json
 * the missing config option "authenticationMethod": "route" in ui5.yaml takes precedence
 * and does not require any route protection on /backend
 */
test("no auth in yaml, xsuaa auth in route -> route is unprotected", async (t) => {
	const { ui5 } = await prepUI5ServerConfig({
		ui5Yaml: "./test/no-auth/ui5-no-auth-in-yaml.yaml",
		appRouterPort: t.context.port.appRouter,
		xsAppJson: "./test/auth/xs-app.json",
		defaultEnvJson: "./test/auth/default-env.json",
		tmpDir: t.context.tmpDir
	})

	// start ui5-app with modified route(s) and config
	const child = spawn(`ui5 serve --port ${t.context.port.ui5Server} --config ${ui5.yaml}`, {
		// stdio: 'inherit', // > don't include stdout in test output
		shell: true,
		cwd: t.context.tmpDir,
		detached: true // this for being able to kill all subprocesses of above `ui5 serve` later
	})

	// wait for ui5 server and app router to boot
	await waitOn({ resources: [`tcp:${t.context.port.ui5Server}`, `tcp:${t.context.port.appRouter}`] })

	const app = request(`http://localhost:${t.context.port.ui5Server}`)
	// test for the app being started correctly
	const responseIndex = await app.get("/index.html")
	t.is(responseIndex.status, 200, "http 200 on index")

	// backend resource is accessible w/o authentication
	const responseNoAuth = await app.get("/backend/")
	t.is(responseNoAuth.status, 200)
	t.true(responseNoAuth.body.value.length >= 1, "one or more odata entities received")

	// kill all processes that are in the same pid group (see detached: true)
	process.kill(-child.pid)
})

/**
 * protect a local html file with app router, so accessing it "proxied" via
 * ui5 serve results in a redirect to the idp
 */
test("allow localDir usage in app router for auth-protected static files", async (t) => {
	const { ui5 } = await prepUI5ServerConfig({
		ui5Yaml: "./test/auth/ui5-with-localDir.yaml",
		appRouterPort: t.context.port.appRouter,
		xsAppJson: "./test/auth/xs-app-with-localDir.json",
		defaultEnvJson: "./test/auth/default-env.json",
		tmpDir: t.context.tmpDir
	})

	// provide the static asset that is protected via app router
	await fs.copy(path.resolve("./test/auth/index1.html"), `${t.context.tmpDir}/webapp/index1.html`)

	// start ui5-app with modified route(s) and config
	const child = spawn(`ui5 serve --port ${t.context.port.ui5Server} --config ${ui5.yaml}`, {
		// stdio: 'inherit', // > don't include stdout in test output
		shell: true,
		cwd: t.context.tmpDir,
		detached: true // this for being able to kill all subprocesses of above `ui5 serve` later
	})

	// wait for ui5 server and app router to boot
	await waitOn({ resources: [`tcp:${t.context.port.ui5Server}`, `tcp:${t.context.port.appRouter}`] })

	const app = request(`http://localhost:${t.context.port.ui5Server}`)
	// test for the app being started correctly
	const responseIndex = await app.get("/index.html")
	t.is(responseIndex.status, 200, "http 200 on index")

	// test for the redirect reponse to /index1.html
	// include code for client-side redirect to idp
	const responseIdpRedirect = await app.get("/index1.html")
	t.is(responseIdpRedirect.status, 200)
	t.true(
		responseIdpRedirect.text.includes("https://authentication.eu10.hana.ondemand.com/oauth/authorize"),
		"oauth endpoint redirect injected"
	)

	// access /index2.html as an unprotected route to the physical index1.html
	const responseNoAuth = await app.get("/index2.html")
	t.is(responseNoAuth.status, 200)
	t.true(responseNoAuth.text.includes("placeholder"))

	// kill all processes that are in the same pid group (see detached: true)
	process.kill(-child.pid)
})

/**
 * multitenant context
 * expected result: redirect to subscribed subaccount idp for route /backend
 */
test("(multitenant) auth in yaml, xsuaa auth in route -> route is protected", async (t) => {
	await prepUI5ServerConfig({
		ui5Yaml: "./test/multitenant/ui5-auth-multitenant.yaml",
		appRouterPort: t.context.port.appRouter,
		xsAppJson: "./test/multitenant/xs-app.json",
		defaultEnvJson: "./test/multitenant/default-env.json",
		tmpDir: t.context.tmpDir
	})

	// mock local DNS for multi-tenany on "foo"
	nock(`http://foo.localhost:${t.context.port.appRouter}`)
		.get("/backend/")
		.reply(200, (_, __, cb) => {
			fs.readFile("./test/multitenant/mockedApprouterResonse.html", cb)
		})

	// start ui5-app with modified route(s) and config - in this test case, do things programmatically
	// with the ui5 server api instead of spawning sub-processes
	// reason: above DNS mock; nock needs to attach to the current running process and can't attach to a sub-process
	const { graphFromPackageDependencies } = await import("@ui5/project/graph")
	const graph = await graphFromPackageDependencies({ cwd: t.context.tmpDir })

	// install a global hook to register the approuter instances
	globalThis["ui5-middleware-approuter"] = {
		approuters: []
	}

	const server = await import("@ui5/server")
	let serve = await server.serve(graph, { port: t.context.port.ui5Server })

	// get the approuter instance
	const approuter = globalThis["ui5-middleware-approuter"]?.approuters?.pop()

	// wait for ui5 server and app router to boot
	// -- probably don't need this as we're `await`ing server.serve() above?
	// await waitOn({ resources: [`tcp:${t.context.port.ui5Server}`, `tcp:${t.context.port.appRouter}`] })

	const app = request(`http://localhost:${t.context.port.ui5Server}`)
	// test for the app being started correctly
	const responseIndex = await app.get("/index.html")
	t.is(responseIndex.status, 200, "http 200 on index")

	// test for the redirect reponse to
	// include code for multi-tenant aware client-side redirect to idp
	const responseIdpRedirect = await app.get("/backend/")
	t.is(responseIdpRedirect.status, 200)
	const text = responseIdpRedirect.body.toString("utf-8") // response is application/octet-stream => responseIdpRedirect.text is not available!
	t.true(
		text.includes("https://foo.authentication.eu10.hana.ondemand.com/oauth/authorize"),
		"multi-tenant oauth endpoint redirect injected"
	)

	// clean up DNS mock
	nock.cleanAll()
	nock.restore()

	// clean up programmatic ui5 server
	const _close = (server) =>
		new Promise((resolve, reject) => {
			server.close((error) => {
				if (error) {
					reject(error)
				} else {
					resolve()
				}
			})
		})

	await _close(approuter)
	await _close(serve)
})

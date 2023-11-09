const crypto = require("crypto")
const fs = require("fs-extra")
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

test("ui5.yaml: no config -> default options apply", async (t) => {
	const { ui5 } = await prepUI5ServerConfig({
		ui5Yaml: "./test/options/ui5-no-config.yaml",
		appRouterPort: 5000,
		xsAppJson: "./test/options/xs-app-minimal.json",
		tmpDir: t.context.tmpDir
	})

	// start ui5-app with modified route(s) and config
	const child = spawn(`ui5 serve --port ${t.context.port.ui5Server} --config ${ui5.yaml}`, {
		// stdio: "inherit", // > don't include stdout in test output
		shell: true,
		cwd: t.context.tmpDir,
		detached: true // this for being able to kill all subprocesses of above `ui5 serve` later
	})

	// wait for ui5 server and app router to boot
	await waitOn({ resources: [`tcp:${t.context.port.ui5Server}`, `tcp:5000`] })

	const app = request(`http://localhost:${t.context.port.ui5Server}`)
	// test for the app being started correctly
	const responseIndex = await app.get("/index.html")
	t.is(responseIndex.status, 200, "http 200 on index")

	// kill all processes that are in the same pid group (see detached: true)
	process.kill(-child.pid)
})

/**
 * app router port, xs app json + 1 destination is set in ui5.yaml
 * -> respective default options (port 5000, 0 destinations) should be overriden
 */
test("ui5.yaml: some config -> default options are overwritten", async (t) => {
	const { ui5 } = await prepUI5ServerConfig({
		ui5Yaml: "./test/options/ui5-some-config.yaml",
		appRouterPort: t.context.port.appRouter,
		xsAppJson: "./test/options/xs-app-with-routes.json",
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

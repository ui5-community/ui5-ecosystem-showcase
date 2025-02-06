const { randomBytes } = require("crypto")
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
	t.context.tmpDir = path.resolve(`./test/_ui5-app/${randomBytes(5).toString("hex")}`)
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

// https://github.com/avajs/ava/blob/main/docs/03-assertions.md

test("rewrite content", async (t) => {
	const { ui5 } = await prepUI5ServerConfig({
		ui5Yaml: "./test/rewrite/ui5.yaml",
		appRouterPort: t.context.port.appRouter,
		xsAppJson: "./test/rewrite/xs-app.json",
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

	const baseUri = `http://localhost:${t.context.port.ui5Server}`
	const app = request(baseUri)
	// test for the app being started correctly
	const responseIndex = await app.get("/index.html")
	t.is(responseIndex.status, 200, "http 200 on index")

	// rewriting application/json
	const respRoot = await app.get("/backendv4/")
	t.is(respRoot.status, 200, "http 200 on root")
	t.is(respRoot.body["@odata.context"], `${baseUri}/backendv4/$metadata`, "OData context rewritten")

	// rewriting application/atom+xml
	const respMetadata = await app.get("/backendv2/Categories?$format=atom")
	t.is(respMetadata.status, 200, "http 200 on categories")
	t.true(respMetadata.text.indexOf(`<feed xml:base="${baseUri}/backendv2/"`) !== -1, "OData context rewritten")

	// kill all processes that are in the same pid group (see detached: true)
	process.kill(-child.pid)
})

test("no rewrite content", async (t) => {
	const { ui5 } = await prepUI5ServerConfig({
		ui5Yaml: "./test/rewrite/ui5-rewrite-disabled.yaml",
		appRouterPort: t.context.port.appRouter,
		xsAppJson: "./test/rewrite/xs-app.json",
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

	const baseUri = `http://localhost:${t.context.port.ui5Server}`
	const app = request(baseUri)
	// test for the app being started correctly
	const responseIndex = await app.get("/index.html")
	t.is(responseIndex.status, 200, "http 200 on index")

	// rewriting application/json
	const respRoot = await app.get("/backendv4/")
	t.is(respRoot.status, 200, "http 200 on root")
	t.is(
		respRoot.body["@odata.context"],
		`http://services.odata.org/V4/(S(fdng4tbvlxgzpdtpfap2rqss))/TripPinServiceRW/$metadata`,
		"OData context not rewritten"
	)

	// rewriting application/atom+xml
	const respMetadata = await app.get("/backendv2/Categories?$format=atom")
	t.is(respMetadata.status, 200, "http 200 on categories")
	t.true(
		respMetadata.text.indexOf(`<feed xml:base="https://services.odata.org/V2/northwind/Northwind.svc/"`) !== -1,
		"OData context not rewritten"
	)

	// kill all processes that are in the same pid group (see detached: true)
	process.kill(-child.pid)
})

test("partial rewrite content", async (t) => {
	const { ui5 } = await prepUI5ServerConfig({
		ui5Yaml: "./test/rewrite/ui5-rewrite-partial.yaml",
		appRouterPort: t.context.port.appRouter,
		xsAppJson: "./test/rewrite/xs-app.json",
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

	const baseUri = `http://localhost:${t.context.port.ui5Server}`
	const app = request(baseUri)
	// test for the app being started correctly
	const responseIndex = await app.get("/index.html")
	t.is(responseIndex.status, 200, "http 200 on index")

	// rewriting application/json
	const respRoot = await app.get("/backendv4/")
	t.is(respRoot.status, 200, "http 200 on root")
	t.is(respRoot.body["@odata.context"], `${baseUri}/backendv4/$metadata`, "OData context not rewritten")

	// rewriting application/atom+xml
	const respMetadata = await app.get("/backendv2/Categories?$format=atom")
	t.is(respMetadata.status, 200, "http 200 on categories")
	t.true(
		respMetadata.text.indexOf(`<feed xml:base="https://services.odata.org/V2/northwind/Northwind.svc/"`) !== -1,
		"OData context not rewritten"
	)

	// kill all processes that are in the same pid group (see detached: true)
	process.kill(-child.pid)
})

const crypto = require("crypto")
const fs = require("fs-extra")
const path = require("path")
const request = require("supertest")
const { spawn } = require("child_process")
const test = require("ava")
const waitOn = require("wait-on")

const copyUI5app = require("./_fs_app_util")
const prepUI5ServerConfig = require("./_prep_server_util")
const { parse: parseDotEnv } = require("dotenv")
const { stringify: stringifyDotEnv } = require("envfile")

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

// https://github.com/avajs/ava/blob/main/docs/03-assertions.md

test("test valid destinations in .env file", async (t) => {
	// adjust .env file copied from app directory
	const envFileContent = fs.readFileSync(`${t.context.tmpDir}/.env`)
	const envFileObj = parseDotEnv(envFileContent)

	// fill valid destination string
	envFileObj.xsapp_dest = JSON.stringify([
		{ name: "backend", url: "https://services.odata.org/V4/(S(fdng4tbvlxgzpdtpfap2rqss))/TripPinServiceRW/" }
	])
	fs.writeFileSync(`${t.context.tmpDir}/.env`, stringifyDotEnv(envFileObj))

	const { ui5 } = await prepUI5ServerConfig({
		ui5Yaml: "./test/dest-in-env/ui5.yaml",
		appRouterPort: t.context.port.appRouter,
		xsAppJson: "./test/dest-in-env/xs-app.json",
		tmpDir: t.context.tmpDir
	})

	// start ui5-app with modified route(s) and config
	const child = spawn(`ui5 serve --port ${t.context.port.ui5Server} --config ${ui5.yaml}`, {
		// stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: t.context.tmpDir,
		detached: true // this for being able to kill all subprocesses of above `ui5 serve` later
	})

	try {
		// wait for ui5 server and app router to boot
		await waitOn({ resources: [`tcp:${t.context.port.ui5Server}`, `tcp:${t.context.port.appRouter}`] })
	} catch (error) {
		process.kill(-child.pid)
		return
	}

	const baseUri = `http://localhost:${t.context.port.ui5Server}`
	const app = request(baseUri)
	// test for the app being started correctly
	const responseIndex = await app.get("/index.html")
	t.is(responseIndex.status, 200, "http 200 on index")

	// testing backend being available
	const respRoot = await app.get("/backend/")
	t.is(respRoot.status, 200, "http 200 on root")

	// retrieving people
	const respGET = await app.get("/backend/People")
	t.is(respGET.status, 200, "http 200 on GET /backend/People")
	t.true(respGET.body.value.length > 0, "Entries found")

	// kill all processes that are in the same pid group (see detached: true)
	process.kill(-child.pid)
})

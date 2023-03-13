const crypto = require("crypto")
const fs = require("fs-extra")
const nock = require("nock")
const normalizer = require("@ui5/project").normalizer
const path = require("path")
const replace = require("replace-in-file")
const request = require("supertest")
const server = require("@ui5/server").server
const { spawn } = require("child_process")
const test = require("ava")
const waitOn = require("wait-on")

const copyUI5app = require("./_fs_app_util")
const prepUi5ServerConfig = require("./_prep_server_util")

test.beforeEach(async (t) => {
	// copy ui5 app to a temp dir in test folder scope
	t.context.tmpDir = path.resolve(`./test/_ui5-app/${crypto.randomBytes(5).toString("hex")}`)
	await copyUI5app(t.context.tmpDir)

	// dynamic port allocation for ui5 serve
	const getPort = (await import("get-port")).default
	t.context.port = {
		ui5Sserver: await getPort(),
		appRouter: await getPort()
	}
})

test.afterEach.always(async (t) => {
	// cleanup
	await fs.remove(t.context.tmpDir)
})

// https://github.com/avajs/ava/blob/main/docs/03-assertions.md

test("crud commands (GET, POST, PUT, DELETE)", async (t) => {
	const { ui5 } = await prepUi5ServerConfig({
		ui5Yaml: "./test/crud/ui5.yaml",
		appRouterPort: t.context.port.appRouter,
		xsAppJson: "./test/crud/xs-app.json",
		tmpDir: t.context.tmpDir
	})

	// start ui5-app with modified route(s) and config
	const child = spawn(`ui5 serve --port ${t.context.port.ui5Sserver} --config ${ui5.yaml}`, {
		// stdio: "inherit", // > don't include stdout in test output,
		shell: true,
		cwd: t.context.tmpDir,
		detached: true // this for being able to kill all subprocesses of above `ui5 serve` later
	})

	// wait for ui5 server and app router to boot
	await waitOn({ resources: [`tcp:${t.context.port.ui5Sserver}`, `tcp:${t.context.port.appRouter}`] })

	const baseUri = `http://localhost:${t.context.port.ui5Sserver}`
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

	// create new person
	const user = `pimue${crypto.randomBytes(5).toString("hex")}`
	const respPOST = await app
		.post("/backend/People")
		.send({
			UserName: user,
			FirstName: "Pi",
			LastName: "Mue",
			Emails: [`${user}@example.com`],
			AddressInfo: [
				{
					Address: "127.0.0.1",
					City: {
						Name: "Localhost",
						CountryRegion: "Internet",
						Region: "WWW"
					}
				}
			]
		})
		.set("Content-Type", "application/json")
	t.is(respPOST.status, 201, "http 201 on POST /backend/People")

	// retrieve the etag
	let etag = respPOST.body["@odata.etag"]

	// lookup new people
	const respGET1 = await app.get(`/backend/People('${user}')`)
	t.is(respGET1.status, 200, `http 200 on GET /backend/People('${user}')`)
	//t.true(respGET1.body.length > 0, "Entries found")

	// update person
	const respPUT = await app
		.put(`/backend/People('${user}')`)
		.send({
			FirstName: "Mue",
			LastName: "Pi"
		})
		.set("Content-Type", "application/json")
		.set("If-Match", etag)
	t.is(respPUT.status, 204, `http 204 on PUT /backend/People('${user}')`)

	// retrieve the new etag
	etag = respPUT.headers["etag"]

	// lookup modified people
	const respGET2 = await app.get(`/backend/People('${user}')`)
	t.is(respGET2.status, 200, `http 200 on GET /backend/People('${user}')`)

	// delete person
	const respDELETE = await app.delete(`/backend/People('${user}')`).set("If-Match", etag)
	t.is(respDELETE.status, 204, `http 204 on DELETE /backend/People('${user}')`)

	// lookup non-existing people
	const respGET3 = await app.get(`/backend/People('${user}')`)
	t.is(respGET3.status, 204, `http 204 on GET /backend/People('${user}')`)

	// kill all processes that are in the same pid group (see detached: true)
	process.kill(-child.pid)
})

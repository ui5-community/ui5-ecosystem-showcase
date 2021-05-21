const crypto = require("crypto")
const fs = require("fs-extra")
const getPort = require('get-port')
const path = require("path")
const request = require("supertest")
const { spawn } = require("child_process")
const test = require('ava')
const waitOn = require("wait-on")


/**
 * copy showcase ui5 app for test purposes
 * and rm included xs-app.json
 * 
 * @param {string} tmpDir path to copy ui5 app (that acts as the test app to)
 */
async function copyUI5app(tmpDir) {
    await fs.mkdir(tmpDir)
    const filterFn = (src, _) => {
        const yo = ["node_modules", "dist"].find(node => src.endsWith(node))
        return yo === undefined ? true : false
    }
    await fs.copy(path.resolve(__dirname, "../../ui5-app"), tmpDir, {
        filter: filterFn
    })
    await fs.remove(path.resolve(tmpDir, "xs-app.json"))
}

test.beforeEach(async (t) => {
    // copy ui5 app to a temp dir in test folder scope
    t.context.tmpDir = path.resolve(`./test/_ui5-app/${crypto.randomBytes(5).toString("hex")}`)
    await copyUI5app(t.context.tmpDir)

    // dynamic port allocation for ui5 serve
    t.context.port = await getPort()
})

test.afterEach.always(async t => {
    // cleanup
    await fs.remove(t.context.tmpDir)
})


test('auth in yaml, xsuaa auth in route', async t => {
    // prep ui5 server runtime config/env files
    const ui5 = { yaml: path.resolve("./test/auth/ui5-auth-in-yaml.yaml") }
    const xsapp = { json: path.resolve("./test/auth/xs-app.json") }
    const defaultEnv = { json: path.resolve("./test/auth/default-env.json") }

    // prep authenticated routes + authentication config
    await fs.copy(xsapp.json, path.resolve(t.context.tmpDir, "xs-app.json"))
    await fs.copy(defaultEnv.json, path.resolve(t.context.tmpDir, "default-env.json"))

    // start ui5-app with modified route(s) and config
    const child = spawn(`ui5 serve --port ${t.context.port} --config ${ui5.yaml}`, {
        // stdio: 'inherit', // > don't include stdout in test output
        shell: true,
        cwd: t.context.tmpDir
    })

    // wait for ui5 server and app router to boot
    await waitOn({ resources: [`tcp:${t.context.port}`, "tcp:1091"] })

    const app = request(`http://localhost:${t.context.port}`)
    // test for the app being started correctly
    const responseIndex = await app.get("/index.html")
    t.is(responseIndex.status, 200, "http 200 on index")

    // test for the redirect reponse to
    // include code for client-side redirect to idp
    const responseIdpRedirect = await app.get("/backend/")
    t.is(responseIdpRedirect.status, 200)
    t.true(responseIdpRedirect.text.includes("https://authentication.eu10.hana.ondemand.com/oauth/authorize"), "oauth endpoint redirect injected")

    child.kill() // don't take it literally
})


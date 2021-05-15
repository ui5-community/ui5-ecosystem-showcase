const fs = require("fs-extra")
const path = require("path")
const request = require("supertest")
const { spawn } = require("child_process")
const test = require('ava')
const waitOn = require("wait-on")

test.before(async () => {
    // bak xs-app.json
    const src = path.resolve(__dirname, "../../ui5-app/xs-app.json")
    const dest = path.resolve(__dirname, "../../ui5-app/xs-app.json.bak")
    await fs.move(src, dest, { overwrite: true })
})
test.after.always(async () => {
    // restore bak'ed xs-app.json
    const src = path.resolve(__dirname, "../../ui5-app/xs-app.json.bak")
    const dest = path.resolve(__dirname, "../../ui5-app/xs-app.json")
    await fs.move(src, dest, { overwrite: true })

    // rm any default-env.json's
    await fs.remove(path.resolve(__dirname, "../../ui5-app/default-env.json"))
})
test.beforeEach(async () => {
    // clean route slate
    await fs.remove(path.resolve(__dirname, "../../ui5-app/xs-app.json"))
})
test.afterEach(async () => {
    // rm xs-app.json from ui5 sample app
    await fs.remove(path.resolve(__dirname, "../../ui5-app/xs-app.json"))
})

test.serial('auth in yaml, xsuaa auth in route', async t => {
    // prep ui5 server runtime config/env files
    const ui5 = { yaml: path.resolve("./test/auth/ui5-auth-in-yaml.yaml") }
    const xsapp = { json: path.resolve("./test/auth/xs-app.json") }
    const defaultEnv = { json: path.resolve("./test/auth/default-env.json") }

    // prep authenticated routes + authentication config
    await fs.ensureSymlink(xsapp.json, path.resolve(__dirname, "../../ui5-app/xs-app.json"))
    await fs.ensureSymlink(defaultEnv.json, path.resolve(__dirname, "../../ui5-app/default-env.json"))

    // start ui5-app with modified route(s) and config
    const child = spawn(`yarn workspace ui5-app ui5 serve --port 1081 --config ${ui5.yaml}`, {
        // stdio: 'inherit', // > don't include stdout in test output
        shell: true
    })
    // wait for ui5 server and app router to boot
    await waitOn({ resources: ["tcp:1081", "tcp:1091"] })

    const app = request("http://localhost:1081")
    // test for the app being started correctly
    const responseIndex = await app.get("/index.html")
    t.is(responseIndex.status, 200, "http 200 on index")

    const responseIdpRedirect = await app.get("/backend/")
    t.is(responseIdpRedirect.status, 200)
    t.true(responseIdpRedirect.text.includes("https://authentication.eu10.hana.ondemand.com/oauth/authorize"), "oauth endpoint redirect injected")

    child.kill() // don't take it literally

})

// test('bar', async t => {
//     const bar = Promise.resolve('bar')
//     t.is(await bar, 'bar')
// })
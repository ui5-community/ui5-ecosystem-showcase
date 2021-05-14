const fs = require("fs-extra")
const path = require("path")
const test = require('ava')
const waitOn = require("wait-on")

const exec = require('child_process').exec
const normalizer = require("@ui5/project").normalizer
const server = require("@ui5/server").server

test.before(async () => {
    // bak xs-app.json
    const src = path.resolve(__dirname, "../../ui5-app/xs-app.json")
    const dest = path.resolve(__dirname, "../../ui5-app/xs-app.json.bak")
    await fs.move(src, dest, { overwrite: true })
})
test.after(async () => {
    // restore bak'ed xs-app.json
    const src = path.resolve(__dirname, "../../ui5-app/xs-app.json.bak")
    const dest = path.resolve(__dirname, "../../ui5-app/xs-app.json")
    await fs.move(src, dest, { overwrite: true })

    // rm any default-env.json's
    await fs.remove(path.resolve(__dirname, "../../ui5-app/default-env.json"))
})
test.beforeEach(async () => {
    // rm xs-app.json from ui5 sample app
    // await fs.remove(path.resolve(__dirname, "../../ui5-app/xs-app.json"))
})
test.afterEach(async () => {
    // rm xs-app.json from ui5 sample app
    await fs.remove(path.resolve(__dirname, "../../ui5-app/xs-app.json"))
})

test('auth in yaml, xsuaa auth in route', async t => {
    const ui5 = { yaml: path.resolve("./test/auth/ui5-auth-in-yaml.yaml") }
    const xsapp = { json: path.resolve("./test/auth/xs-app.json") }
    await fs.ensureSymlink(xsapp.json, path.resolve(__dirname, "../../ui5-app/xs-app.json"))

    exec(`yarn workspace ui5 serve --port 1081 --config ${ui5.yaml}`, (error, stdout, stderr) => {})
    await waitOn({resources:["tcp:1081"]})

    // const docroot = await normalizer.generateProjectTree({ cwd: path.resolve(__dirname, "../../ui5-app") })
    // const s = await server.serve(docroot, { port: 1081 })


    t.pass()

})

// test('bar', async t => {
//     const bar = Promise.resolve('bar')
//     t.is(await bar, 'bar')
// })
const fs = require("fs-extra")
const path = require("path")
const test = require('ava')

const fixturePath = path.resolve(`${__dirname}`, "ui5-app")

test.before(async t => {
   await fs.copy("../ui5-app/webapp", path.resolve(fixturePath, "webapp"))
})

test('foo', t => {
    t.pass()
})

// test('bar', async t => {
//     const bar = Promise.resolve('bar')
//     t.is(await bar, 'bar')
// })

test.after(async t => {
    await fs.remove(fixturePath)
})
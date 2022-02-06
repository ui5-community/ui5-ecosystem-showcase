
const log = require('@ui5/logger').getLogger('server:custommiddleware:code-coverage')
const im = require('nyc-middleware')
const express = require('express')
const path = require('path')
const url = require('url')
const fs = require('fs')
const cors = require('cors')
const nyc = require('nyc')
const cp = require('child_process')
// const { spawn } = require('child_process');


function matcher(req) {
  const parsed = url.parse(req.url)

  if (parsed.pathname.match(/\.js$/) && !parsed.pathname.match(/jquery/) && !parsed.pathname.match(/resources/)) {
    return parsed.pathname
  }
  return null
}

/**
 * Custom UI5 Server middleware example
 *
 * @param {Object} parameters Parameters
 * @param {Object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.
 *                                        all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.
 *                                        rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies
 *                                        Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {Object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration
 *                                                      if given in ui5.yaml
 * @returns {function} Middleware function to use
 */
// eslint-disable-next-line func-names
module.exports = function ({
  options,
}) {
  const watchPath = options.configuration.path || 'webapp'

  if (options.configuration.enabled === 'true') {
    // Works for clientside
    const app = express()

    // set up basic middleware


    const publicDir = path.join(process.cwd(), watchPath)
    im.hookLoader(publicDir)

    app.use(cors())

    app.use('/coverage', im.createHandler({
      verbose: true,
      resetOnGet: true,
    }))
    app.use(im.createClientHandler(publicDir, {
      matcher,
    }))
    log.info('Coverage is running on port 3000')
    app.listen(3000)
  }


  // eslint-disable-next-line func-names
  return function (req, res, next) {
    if (options.configuration.enabled === 'false') {
      next()
    } else {
      const pathname = matcher(req)
      const excludePath = (options.configuration.exclude) ? options.configuration.exclude.split(',') : []

      if (pathname) {
        const file = path.join(process.cwd(), watchPath + pathname)
        const pathNameArr = pathname.split('/')
        pathNameArr.pop()
        if (excludePath.filter(sPath => pathNameArr.toString().includes(sPath)) < 1) {
          let code
          try {
            code = fs.readFileSync(file, 'utf8')
            log.info(`Request for ${file} received.`)
          } catch (err) {
            log.error(`Request for ${file} failed.`)
            next()
          }

          if (code) {
            const instrumenter = im.getInstrumenter()
            res.send(instrumenter.instrumentSync(code, file))
          }
        } else {
          log.info(`${file} is part of a library exclusion in the ui5.yaml file.`)
          next()
        }
      } else {
        next()
      }
    }
  }
}
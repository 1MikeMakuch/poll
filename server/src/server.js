'use strict'

const express = require('express')
const debug = require('debug')('poll:server')
const debugE = require('debug')('poll:error:server')
const app = express()
const db = require('./db')
const api = require('./api')
const utils = require('./utils')

// Load env variables from .env
try {
  require('dotenv').config({path: './.env', silent: true})
} catch (e) {
  debugE('Error loading .env', e)
}

app.set('trust proxy', true)
app.use(require('cookie-parser')())
app.use(require('body-parser').text({type: ['text/plain', 'text/html']}))
app.use(require('body-parser').json({limit: '1mb', parameterLimit: 10}))

async function server() {
  let {mysql, options} = await db.init()

  let uiurl = process.env.URL || '*'

  debug('init')

  app.use((req, res, next) => {
    debug(req.ip, req.method, req.url, JSON.stringify({body: req.body}))
    next()
  })

  api.init(app)

  app.use((err, req, res, next) => {
    debugE('Error in HTTP handler:', req.ip, req.protocol, req.method, req.path, err)
    res.status(500).send('Server Error!\n')
    res.end()
    next()
  })

  debug('version:', 'listening on ', process.env.SERVER_PORT)
  app.listen(process.env.SERVER_PORT)
}

server()

module.exports = {app}

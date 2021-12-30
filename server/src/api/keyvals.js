'use strict'

const utils = require('../utils')
const db = require('../db')
const debug = require('debug')('poll:apis')
const debugE = require('debug')('poll:error::apis')
const _ = require('lodash')

require('dotenv').config()

var mysql

async function getKeyVals(req, res) {
  let id = req.params.id

  if (!id) {
    return res.sendStatus(404)
  }

  let result

  try {
    result = await db.keyvals.get(id)
  } catch (e) {
    debugE(e)
    return res.status(404).send(e)
  }
  if (undefined === result) res.sendStatus(404)

  res.send(result)
}
async function postKeyVals(req, res) {
  let id = req.params.id
  let data = req.body

  if (!id) {
    debugE('id required')
    return res.status(400).send('id required').end()
  }

  if (!data) {
    debugE('data required')
    return res.status(400).send('data required').end()
  }

  let result
  try {
    result = await db.keyvals.set(id, data)
  } catch (e) {
    debugE(e)
    return res.sendStatus(400)
  }

  res.sendStatus(201)
}

async function delKeyVals(req, res) {
  let id = req.params.id

  if (!id) {
    return res.sendStatus(404)
  }

  let results

  try {
    results = await db.keyvals.del(id)
  } catch (e) {
    debugE(e)
    return res.sendStatus(400)
  }
  if (results.affectedRows) {
    res.sendStatus(200)
  } else {
    res.sendStatus(400)
  }
}

function init(app) {
  debug('init')

  app.get('/api/keyvals/:id', getKeyVals)
  app.post('/api/keyvals/:id', postKeyVals)
  app.put('/api/keyvals/:id', postKeyVals)
  app.delete('/api/keyvals/:id', delKeyVals)
}

module.exports = {init}

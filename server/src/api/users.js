'use strict'

const utils = require('../utils')
const db = require('../db')
const debug = require('debug')('poll:api:users')
const debugE = require('debug')('poll:error::api:users')
const _ = require('lodash')

require('dotenv').config()

var mysql

async function getUser(req, res) {
  let id = _.get(req.params, 'id')
  let email = _.get(req.query, 'email')

  if (!id && !email) {
    return returnError(400, 'id or email required', res)
  }
  let query
  if (id) query = {id}
  if (email) query = {email}

  let result
  try {
    result = await db.users.get(query)
  } catch (e) {
    debugE(e)
    return res.sendStatus(404).send(e)
  }
  if (undefined === result) res.sendStatus(404)

  res.send(result)
}
async function getUsers(req, res) {
  let result
  try {
    result = await db.users.select(req.query)
  } catch (e) {
    debugE(e)
    return res.sendStatus(404).send(e)
  }
  if (undefined === result) res.sendStatus(404)

  res.send(result)
}
function returnError(code, desc, res) {
  debugE(code, desc)
  res.status(code).send(desc).end()
}
async function postUsers(req, res) {
  let result
  try {
    result = await db.users.create(req.body)
  } catch (e) {
    debugE(e)
    return res.sendStatus(400)
  }
  debug('\n\npostUsers', JSON.stringify(result), '\n')
  res.status(201).send(result).end()
}
async function putUsers(req, res) {
  let user = {}

  let id = _.get(req.params, 'id')
  if (!id) {
    return returnError(400, 'id required', res)
  }

  let email = _.get(req.body, 'email')
  let name = _.get(req.body, 'name')

  if (!email && !name) {
    return returnError(400, 'email or name required', res)
  }
  user = {id, email, name}

  let result
  try {
    result = await db.users.update(user)
  } catch (e) {
    debugE(e)
    return res.sendStatus(400)
  }

  res.sendStatus(201)
}
async function delUsers(req, res) {
  let id = _.get(req, 'params.id')

  if (!id) {
    return returnError(400, 'id required', res)
  }

  let results

  try {
    results = await db.users.del({id})
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

  app.get('/api/users/:id', getUser)
  app.get('/api/users', getUsers)
  app.post('/api/users/', postUsers)
  app.put('/api/users/:id', putUsers)
  app.delete('/api/users/:id', delUsers)
}

module.exports = {init}

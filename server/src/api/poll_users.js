'use strict'

const utils = require('../utils')
const db = require('../db')
const debug = require('debug')('poll:api:poll_users')
const debugE = require('debug')('poll:error::api:poll_users')
const _ = require('lodash')

require('dotenv').config()

var mysql

async function getPollUser(req, res) {
  let id = _.get(req.params, 'id')

  if (!id) {
    return returnError(400, 'id required', res)
  }
  let query
  if (id) query = {id}

  let result
  try {
    result = await db.poll_users.get(query)
  } catch (e) {
    debugE(e)
    return res.sendStatus(404).send(e)
  }
  if (undefined === result) res.sendStatus(404)

  res.send(result)
}
// async function getPollUsers(req, res) {
//   let result
//   try {
//     result = await db.poll_users.select(req.query)
//   } catch (e) {
//     debugE(e)
//     return res.sendStatus(404).send(e)
//   }
//   if (undefined === result) res.sendStatus(404)

//   res.send(result)
// }
function returnError(code, desc, res) {
  debugE(code, desc)
  res.status(code).send(desc).end()
}
async function postPollUsers(req, res) {
  debug('postPollUsers', JSON.stringify(req.body))
  let result
  try {
    result = await db.poll_users.create(req.body)
  } catch (e) {
    debugE(e)
    return res.sendStatus(400)
  }
  debug('postPollUsers r=', JSON.stringify(result))

  res.status(201).send(result).end()
}
async function putPollUsers(req, res) {
  let id = _.get(req, 'params.id')
  if (!id) {
    return returnError(400, 'id required', res)
  }
  let body = {...req.body, id: id}

  let result
  try {
    result = await db.poll_users.update(body)
  } catch (e) {
    debugE(e)
    return res.sendStatus(400)
  }

  res.sendStatus(201)
}
async function delPollUsers(req, res) {
  let id = _.get(req, 'params.id')

  if (!id) {
    return returnError(400, 'id required', res)
  }

  let results

  try {
    results = await db.poll_users.del({id})
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

  app.get('/api/poll_users/:id', getPollUser)
  //app.get('/api/poll_users', getPollUsers)
  app.post('/api/poll_users/', postPollUsers)
  app.put('/api/poll_users/:id', putPollUsers)
  app.delete('/api/poll_users/:id', delPollUsers)
}

module.exports = {init}

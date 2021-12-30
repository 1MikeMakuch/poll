'use strict'

const utils = require('../utils')
const db = require('../db')
const debug = require('debug')('poll:api:polls')
const debugE = require('debug')('poll:error::api:polls')
const _ = require('lodash')

require('dotenv').config()

var mysql

async function getPolls(req, res) {
  let id = _.get(req.params, 'id')

  if (!id) {
    return returnError(400, 'id required', res)
  }
  let query
  if (id) query = {id}

  let result
  try {
    result = await db.polls.get(query)
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
async function postPolls(req, res) {
  debug('postPolls', JSON.stringify(req.body))
  let result
  try {
    result = await db.polls.create(req.body)
  } catch (e) {
    debugE(e)
    return res.sendStatus(400)
  }
  debug('postPolls r=', JSON.stringify(result))

  res.status(201).send(result).end()
}
async function putPolls(req, res) {
  let id = _.get(req, 'params.id')
  if (!id) {
    return returnError(400, 'id required', res)
  }
  let body = {...req.body, id: id}

  let result
  try {
    result = await db.polls.update(body)
  } catch (e) {
    debugE(e)
    return res.sendStatus(400)
  }

  res.sendStatus(201)
}
async function delPolls(req, res) {
  let id = _.get(req, 'params.id')

  if (!id) {
    return returnError(400, 'id required', res)
  }

  let results

  try {
    results = await db.polls.del({id})
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

  app.get('/api/polls/:id', getPolls)
  //app.get('/api/polls', getPolls)
  app.post('/api/polls/', postPolls)
  app.put('/api/polls/:id', putPolls)
  app.delete('/api/polls/:id', delPolls)
}

module.exports = {init}

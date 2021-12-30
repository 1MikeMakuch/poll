'use strict'

const utils = require('../utils')
const db = require('../db')
const debug = require('debug')('poll:api:questions')
const debugE = require('debug')('poll:error::api:questions')
const _ = require('lodash')

require('dotenv').config()

var mysql

async function getQuestion(req, res) {
  let id = _.get(req.params, 'id')

  if (!id) {
    return returnError(400, 'id required', res)
  }
  let query
  if (id) query = {id}

  let result
  try {
    result = await db.questions.get(query)
  } catch (e) {
    debugE(e)
    return res.sendStatus(404).send(e)
  }
  if (undefined === result) res.sendStatus(404)
  debug('getQuestion', JSON.stringify(result))
  res.send(result)
}

function returnError(code, desc, res) {
  debugE(code, desc)
  res.status(code).send(desc).end()
}
async function postQuestions(req, res) {
  debug('postQuestions', JSON.stringify(req.body))
  let result
  try {
    result = await db.questions.create(req.body)
  } catch (e) {
    debugE(e)
    return res.sendStatus(400)
  }
  debug('postQuestions r=', JSON.stringify(result))

  res.status(201).send(result).end()
}
async function putQuestions(req, res) {
  let id = _.get(req, 'params.id')
  if (!id) {
    return returnError(400, 'id required', res)
  }
  let body = {...req.body, id: id}

  let result
  try {
    result = await db.questions.update(body)
  } catch (e) {
    debugE(e)
    return res.sendStatus(400)
  }

  res.sendStatus(201)
}
async function delQuestions(req, res) {
  let id = _.get(req, 'params.id')

  if (!id) {
    return returnError(400, 'id required', res)
  }

  let results

  try {
    results = await db.questions.del({id})
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

  app.get('/api/questions/:id', getQuestion)
  //app.get('/api/questions', getQuestions)
  app.post('/api/questions', postQuestions)
  app.put('/api/questions/:id', putQuestions)
  app.delete('/api/questions/:id', delQuestions)
}

module.exports = {init}

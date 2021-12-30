'use strict'

const utils = require('../utils')
const db = require('../db')
const debug = require('debug')('poll:api:poll_runs')
const debugE = require('debug')('poll:error::api:poll_runs')
const _ = require('lodash')

require('dotenv').config()

var mysql

function returnError(code, desc, res) {
  debugE(code, desc)
  res.status(code).send(desc).end()
}

// body must contain poll_id && poll_users for the poll_run
// create a poll_run, contains poll_id
// create urls for each user
// send emails
// send it twice

async function postPollRuns(req, res) {
  debug('postPollRuns', JSON.stringify(req.body))

  const poll_id = _.get(req, 'body.poll_id')
  const poll_user_ids = _.get(req, 'body.poll_user_ids')

  if (!poll_id) {
    throw new Error('poll_id required')
  }
  if (!poll_user_ids || !poll_user_ids.length) {
    throw new Error('poll_user_ids required')
  }

  // create poll_run

  let poll_run = {poll_id}

  let result
  try {
    result = await db.poll_runs.create(poll_run)
  } catch (e) {
    debugE(e)
    return res.sendStatus(400)
  }
  debug('postPollRuns r=', JSON.stringify(result))
  poll_run.id = result.id

  //  create urls for each user
  let promises = []
  poll_user_ids.forEach(poll_user_id => {
    promises.push(db.urls.create({poll_run_id: poll_run.id, poll_user_id}))
  })
  let urls = await Promise.all(promises)
  debug('urls', JSON.stringify(urls))

  // send each user notification with unique url
  promises = []
  poll_user_ids.forEach(poll_user_id => {
    promises.push(db.poll_users.get({id: poll_user_id}))
  })
  let poll_users = await Promise.all(promises)
  promises = []
  for (let i = 0; i < poll_users.length; i++) {
    poll_users[i].uuid = urls.find(url => url.poll_user_id === poll_users[i].id)
    promises.push(utils.notify(poll_users[i]))
  }
  let results
  try {
    results = await Promise.all(promises)
  } catch (e) {
    debugE('poll send fail', utils.stringify(e))
    // appropriate ops api alls should be made
  }
  debug('notify results:', JSON.stringify(results))
  for (let i = 0; i < poll_users.length; i++) {
    if (results[i]) {
      // update poll_run_statuses to sent
      // (intentionally ignoring error checking)
      db.poll_run_statuses.create({poll_run_id: poll_run.id, poll_user_id: poll_users[i].id, status: 'sent'})
    }
  }
  //debug('poll_users with uuids', JSON.stringify(poll_users, null, 2))

  res.status(201).send(poll_users).end()
}
async function postPollRunAnswer(req, res) {
  debug('postPollRunAnswer', JSON.stringify(req.params))

  // ignoring error checking ie try/catch

  const question_id = parseInt(req.params.question_id)

  let result

  const url = await db.urls.get({uuid: req.params.uuid})

  // hack: look up last question_id answered to make sure this one is in sequence
  let lastQuestionId = await db.answers.getLastQuestionIdAnswered({
    poll_user_id: url.poll_user_id,
    poll_run_id: url.poll_run_id
  })
  debug('lastQuestionIdAnswered', JSON.stringify(lastQuestionId))
  if (lastQuestionId + 1 != question_id) {
    return res.status(400).send({message: 'questions must be answered in order'})
  }

  const poll_run = await db.poll_runs.get({id: url.poll_run_id})

  let numberOfQuestions = await db.questions.getNumberOfQuestions({
    poll_id: poll_run.poll_id
  })
  let status = 'in_progress'
  if (numberOfQuestions === question_id) {
    status = 'completed'
  }

  debug(
    'postPollRunAnswer statuses:',
    JSON.stringify({
      poll_id: poll_run.poll_id,
      poll_user_id: url.poll_user_id,
      question_id,
      lastQuestionId,
      numberOfQuestions
    })
  )

  result = await db.answers.create({
    poll_user_id: url.poll_user_id,
    poll_run_id: url.poll_run_id,
    answer: req.params.answer,
    question_id
  })

  result = await db.poll_run_statuses.update({
    poll_run_id: url.poll_run_id,
    poll_user_id: url.poll_user_id,
    status
  })

  res.status(201).end()
}

function init(app) {
  debug('init')
  app.post('/api/poll_runs', postPollRuns)
  app.post('/api/poll_run_answer/:uuid/:question_id/:answer', postPollRunAnswer)
}

module.exports = {init}

'use strict'

const utils = require('../utils')
const db = require('../db')
const debug = require('debug')('poll:apis')
const debugE = require('debug')('poll:error::apis')
const _ = require('lodash')

const users = require('./users')
const keyvals = require('./keyvals')
const poll_users = require('./poll_users')
const polls = require('./polls')
const questions = require('./questions')
const poll_runs = require('./poll_runs')

function init(app) {
  debug('init')

  function health(req, res) {
    res.status(200).send('Healthy\n')
    res.end()
  }

  app.get('/api/healthz', health)

  users.init(app)
  keyvals.init(app)
  poll_users.init(app)
  polls.init(app)
  questions.init(app)
  poll_runs.init(app)
}

module.exports = {init}

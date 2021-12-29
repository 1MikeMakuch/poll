'use strict'

const debug = require('debug')('poll:db')
const debugE = require('debug')('poll:error:db')
const mysqlPromise = require('mysql2/promise')

const users = require('./users')
const keyvals = require('./keyvals')
const answers = require('./answers')
const questions = require('./questions')

const urls = require('./urls')
const polls = require('./polls')
const poll_users = require('./poll_users')
const poll_runs = require('./poll_runs')
const poll_run_statuses = require('./poll_run_statuses')

require('dotenv').config()

var mysql

async function mysqlConnect() {
  let config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    timezone: '+00:00'
  }
  debug(JSON.stringify(config))
  mysql = await mysqlPromise.createConnection(config)
  let [v] = await mysql.query('show variables like "version"')
  let [z] = await mysql.query('show variables like "%zone%"')
  debug(JSON.stringify([v, z]))
  return {mysql, options: config}
}

async function execute(sql, values) {
  let results
  try {
    ;[results] = await mysql.execute(sql, values)
  } catch (e) {
    debugE(sql, JSON.stringify(values), e.message)
    throw e
  }
  debug(sql, JSON.stringify({values, results: results}))
  return results
}

async function init() {
  debug('init')
  let c = await mysqlConnect()

  users.init({execute})
  keyvals.init({execute})
  answers.init({execute})
  questions.init({execute})
  urls.init({execute})
  poll_users.init({execute})
  poll_runs.init({execute})
  poll_run_statuses.init({execute})
  polls.init({execute})

  return c
}

module.exports = {init, answers, keyvals, poll_run_statuses, poll_runs, poll_users, polls, questions, urls, users}

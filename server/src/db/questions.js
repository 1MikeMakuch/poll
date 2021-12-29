'use strict'

const debug = require('debug')('poll:db:questions')
const debugE = require('debug')('poll:error::db:questions')
const _ = require('lodash')

var mysql

const KEYS = ['poll_run_id', 'question_id', 'question']

async function get(query) {
  if (!query.id) {
    throw new Error('id required')
  }
  let prop, val
  if (query.id) {
    prop = 'id'
    val = query.id
  }

  let sql = `select * from questions where ${prop} = ?`
  let u = await mysql(sql, [val])
  if (u && u.length) {
    u = u[0]
  } else if (u.length === 0) {
    return undefined
  }
  return u
}

async function create(question) {
  debug('create', JSON.stringify(question))
  if (!question) {
    throw new Error('question attributes required')
  }
  let keys = []
  let values = []

  KEYS.forEach(key => {
    if (_.has(question, key)) {
      keys.push(key)
      values.push(question[key])
    }
  })

  let sql = 'insert into questions (' + keys.join(', ') + ') values (' + values.map(() => '?').join(', ') + ')'

  let r = await mysql(sql, values)
  question = {id: r.insertId, ...question}
  return question
}
async function update(question) {
  if (!question || !question.id) {
    throw new Error('id required')
  }
  if (!question && !question.id) {
    throw new Error('id required')
  }

  let keys = []
  let values = []

  let sql = ''

  KEYS.forEach(key => {
    if (question[key]) {
      if (sql.length) sql += ', '
      sql += key + '= ? '
      values.push(question[key])
    }
  })

  sql = 'update questions set ' + sql + ' where id = ?'

  values.push(question.id)
  return await mysql(sql, values)
}

async function del(query) {
  if (!query.id) {
    throw new Error('id required')
  }
  let prop, val
  if (query.id) {
    prop = 'id'
    val = query.id
  }

  let sql = `delete from questions where ${prop} = ? limit 1`
  return await mysql(sql, [val])
}

async function init(config) {
  debug('init')
  mysql = config.execute
}

module.exports = {init, create, get, update, del}

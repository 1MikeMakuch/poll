'use strict'

const debug = require('debug')('poll:db:answers')
const debugE = require('debug')('poll:error::db:answers')
const _ = require('lodash')

var mysql

const KEYS = ['user_id', 'poll_run_id', 'answer']

async function get(query) {
  if (!query.id) {
    throw new Error('id required')
  }
  let prop, val
  if (query.id) {
    prop = 'id'
    val = query.id
  }

  let sql = `select * from answers where ${prop} = ?`
  let u = await mysql(sql, [val])
  if (u && u.length) {
    u = u[0]
  } else if (u.length === 0) {
    return undefined
  }
  return u
}

async function create(answer) {
  debug('create', JSON.stringify(answer))
  if (!answer) {
    throw new Error('answer attributes required')
  }
  let keys = []
  let values = []

  KEYS.forEach(key => {
    if (_.has(answer, key)) {
      keys.push(key)
      values.push(answer[key])
    }
  })

  let sql = 'insert into answers (' + keys.join(', ') + ') values (' + values.map(() => '?').join(', ') + ')'

  let r = await mysql(sql, values)
  answer = {id: r.insertId, ...answer}
  return answer
}
async function update(answer) {
  if (!answer || !answer.id) {
    throw new Error('id required')
  }
  if (!answer && !answer.id) {
    throw new Error('id required')
  }

  let keys = []
  let values = []

  let sql = ''

  KEYS.forEach(key => {
    if (answer[key]) {
      if (sql.length) sql += ', '
      sql += key + '= ? '
      values.push(answer[key])
    }
  })

  sql = 'update answers set ' + sql + ' where id = ?'

  values.push(answer.id)
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

  let sql = `delete from answers where ${prop} = ? limit 1`
  return await mysql(sql, [val])
}

async function init(config) {
  debug('init')
  mysql = config.execute
}

module.exports = {init, create, get, update, del}

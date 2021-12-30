'use strict'

const debug = require('debug')('poll:db:poll_runs')
const debugE = require('debug')('poll:error::db:poll_runs')
const _ = require('lodash')

var mysql

const KEYS = ['poll_id']

async function get(query) {
  if (!query.id) {
    throw new Error('id required')
  }
  let prop, val
  if (query.id) {
    prop = 'id'
    val = query.id
  }

  let sql = `select * from poll_runs where ${prop} = ?`
  let u = await mysql(sql, [val])
  if (u && u.length) {
    u = u[0]
  } else if (u.length === 0) {
    return undefined
  }
  return u
}

async function create(poll_run) {
  debug('create', JSON.stringify(poll_run))
  if (!poll_run) {
    throw new Error('poll_run attributes required')
  }
  let keys = []
  let values = []

  KEYS.forEach(key => {
    if (_.has(poll_run, key)) {
      keys.push(key)
      values.push(poll_run[key])
    }
  })

  let sql = 'insert into poll_runs (' + keys.join(', ') + ') values (' + values.map(() => '?').join(', ') + ')'

  let r = await mysql(sql, values)
  poll_run = {...poll_run, id: r.insertId}
  debug('create', JSON.stringify(poll_run))
  return poll_run
}
async function update(poll_run) {
  if (!poll_run || !poll_run.id) {
    throw new Error('id required')
  }
  if (!poll_run && !poll_run.id) {
    throw new Error('id required')
  }

  let keys = []
  let values = []

  let sql = ''

  KEYS.forEach(key => {
    if (poll_run[key]) {
      if (sql.length) sql += ', '
      sql += key + '= ? '
      values.push(poll_run[key])
    }
  })

  sql = 'update poll_runs set ' + sql + ' where id = ?'

  values.push(poll_run.id)
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

  let sql = `delete from poll_runs where ${prop} = ? limit 1`
  return await mysql(sql, [val])
}

async function init(config) {
  debug('init')
  mysql = config.execute
}

module.exports = {init, create, get, update, del}

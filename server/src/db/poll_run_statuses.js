'use strict'

const debug = require('debug')('poll_run_status:db:poll_run_statuses')
const debugE = require('debug')('poll_run_status:error::db:poll_run_statuses')
const _ = require('lodash')

var mysql

const KEYS = ['poll_run_id', 'user_id', 'status']

async function get(query) {
  if (!query.id) {
    throw new Error('id required')
  }
  let prop, val
  if (query.id) {
    prop = 'id'
    val = query.id
  }

  let sql = `select * from poll_run_statuses where ${prop} = ?`
  let u = await mysql(sql, [val])
  if (u && u.length) {
    u = u[0]
  } else if (u.length === 0) {
    return undefined
  }
  return u
}

async function create(poll_run_status) {
  debug('create', JSON.stringify(poll_run_status))
  if (!poll_run_status) {
    throw new Error('poll_run_status attributes required')
  }
  let keys = []
  let values = []

  KEYS.forEach(key => {
    if (_.has(poll_run_status, key)) {
      keys.push(key)
      values.push(poll_run_status[key])
    }
  })

  let sql = 'insert into poll_run_statuses (' + keys.join(', ') + ') values (' + values.map(() => '?').join(', ') + ')'

  let r = await mysql(sql, values)
  poll_run_status = {id: r.insertId, ...poll_run_status}
  return poll_run_status
}
async function update(poll_run_status) {
  debug('update', JSON.stringify(poll_run_status))
  if (!poll_run_status && !poll_run_status.id) {
    throw new Error('id required')
  }

  let keys = []
  let values = []

  let sql = ''

  KEYS.forEach(key => {
    if (poll_run_status[key]) {
      if (sql.length) sql += ', '
      sql += key + '= ? '
      values.push(poll_run_status[key])
    }
  })

  sql = 'update poll_run_statuses set ' + sql + ' where id = ?'

  values.push(poll_run_status.id)
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

  let sql = `delete from poll_run_statuses where ${prop} = ? limit 1`
  return await mysql(sql, [val])
}

async function init(config) {
  debug('init')
  mysql = config.execute
}

module.exports = {init, create, get, update, del}

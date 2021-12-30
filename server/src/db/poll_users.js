'use strict'

const debug = require('debug')('poll:db:poll_users')
const debugE = require('debug')('poll:error::db:poll_users')
const _ = require('lodash')

var mysql

const KEYS = ['tenant_id', 'poll_id', 'email', 'first_name', 'last_name', 'phone']

async function get(query) {
  if (!query.id) {
    throw new Error('id required')
  }
  let prop, val
  if (query.id) {
    prop = 'id'
    val = query.id
  }

  let sql = `select * from poll_users where ${prop} = ?`
  let u = await mysql(sql, [val])
  if (u && u.length) {
    u = u[0]
  } else if (u.length === 0) {
    return undefined
  }
  return u
}

async function create(poll_user) {
  debug('create', JSON.stringify(poll_user))
  if (!poll_user) {
    throw new Error('poll_user attributes required')
  }
  if (!_.has(poll_user, 'tenant_id')) {
    throw new Error('tenant_id required')
  }
  let keys = []
  let values = []

  KEYS.forEach(key => {
    if (_.has(poll_user, key)) {
      keys.push(key)
      values.push(poll_user[key])
    }
  })

  let sql = 'insert into poll_users (' + keys.join(', ') + ') values (' + values.map(() => '?').join(', ') + ')'

  let r = await mysql(sql, values)
  poll_user = {...poll_user, id: r.insertId}
  debug('created', JSON.stringify(poll_user))
  return poll_user
}
async function update(poll_user) {
  debug('update', JSON.stringify(poll_user))
  if (!poll_user || !poll_user.id) {
    throw new Error('id required')
  }

  let keys = []
  let values = []

  let sql = ''

  KEYS.forEach(key => {
    if (poll_user[key]) {
      if (sql.length) sql += ', '
      sql += key + '= ? '
      values.push(poll_user[key])
    }
  })

  sql = 'update poll_users set ' + sql + ' where id = ?'

  values.push(poll_user.id)
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

  let sql = `delete from poll_users where ${prop} = ? limit 1`
  return await mysql(sql, [val])
}

async function init(config) {
  debug('init')
  mysql = config.execute
}

module.exports = {init, create, get, update, del}

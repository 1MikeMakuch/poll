'use strict'

const debug = require('debug')('poll:db:users')
const debugE = require('debug')('poll:error::db:users')
const _ = require('lodash')

var mysql

const KEYS = ['tenant_id', 'email', 'name', 'password', 'is_admin']

async function get(query) {
  if (!query.id && !query.email) {
    throw new Error('id or email required')
  }
  let prop, val
  if (query.id) {
    prop = 'id'
    val = query.id
  } else if (query.email) {
    prop = 'email'
    val = query.email
  }

  let sql = `select * from users where ${prop} = ?`
  let u = await mysql(sql, [val])
  if (u && u.length) {
    u = u[0]
  } else if (u.length === 0) {
    return undefined
  }
  return u
}

async function create(user) {
  debug('create', JSON.stringify(user))
  if (!user && !user.email) {
    throw new Error('email required')
  }
  let keys = []
  let values = []

  Object.keys(KEYS).forEach(key => {
    if (_.has(user, key)) {
      keys.push(key)
      values.push(user[key])
    }
  })

  let sql = 'insert into users (' + keys.join(', ') + ') values (' + values.map(() => '?').join(', ') + ')'

  let r = await mysql(sql, values)
  user = {id: r.insertId, ...user}
  return user
}
async function update(user) {
  if (!user || !user.id) {
    throw new Error('id required')
  }
  if (!user && !user.id) {
    throw new Error('id required')
  }

  let keys = []
  let values = []

  let sql = ''

  Object.keys(KEYS).forEach(key => {
    if (user[key]) {
      if (sql.length) sql += ', '
      sql += key + '= ? '
      values.push(user[key])
    }
  })

  sql = 'update users set ' + sql + ' where id = ?'

  values.push(user.id)
  return await mysql(sql, values)
}

async function del(query) {
  if (!query.id && !query.email) {
    throw new Error('id or email required')
  }
  let prop, val
  if (query.id) {
    prop = 'id'
    val = query.id
  } else if (query.email) {
    prop = 'email'
    val = query.email
  }

  let sql = `delete from users where ${prop} = ? limit 1`
  return await mysql(sql, [val])
}

async function init(config) {
  debug('init')
  mysql = config.execute
}

module.exports = {init, create, get, update, del}

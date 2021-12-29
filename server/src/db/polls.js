'use strict'

const debug = require('debug')('poll:db:polls')
const debugE = require('debug')('poll:error::db:polls')
const _ = require('lodash')

var mysql

const KEYS = ['tenant_id', 'name', 'description']

async function get(query) {
  if (!query.id) {
    throw new Error('id required')
  }
  let prop, val
  if (query.id) {
    prop = 'id'
    val = query.id
  }

  let sql = `select * from polls where ${prop} = ?`
  let u = await mysql(sql, [val])
  if (u && u.length) {
    u = u[0]
  } else if (u.length === 0) {
    return undefined
  }
  return u
}

async function create(poll) {
  debug('create', JSON.stringify(poll))
  if (!poll) {
    throw new Error('poll attributes required')
  }
  let keys = []
  let values = []

  KEYS.forEach(key => {
    if (_.has(poll, key)) {
      keys.push(key)
      values.push(poll[key])
    }
  })

  let sql = 'insert into polls (' + keys.join(', ') + ') values (' + values.map(() => '?').join(', ') + ')'

  let r = await mysql(sql, values)
  poll = {id: r.insertId, ...poll}
  return poll
}
async function update(poll) {
  if (!poll || !poll.id) {
    throw new Error('id required')
  }
  if (!poll && !poll.id) {
    throw new Error('id required')
  }

  let keys = []
  let values = []

  let sql = ''

  KEYS.forEach(key => {
    if (poll[key]) {
      if (sql.length) sql += ', '
      sql += key + '= ? '
      values.push(poll[key])
    }
  })

  sql = 'update polls set ' + sql + ' where id = ?'

  values.push(poll.id)
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

  let sql = `delete from polls where ${prop} = ? limit 1`
  return await mysql(sql, [val])
}

async function init(config) {
  debug('init')
  mysql = config.execute
}

module.exports = {init, create, get, update, del}

'use strict'

const debug = require('debug')('poll:db:urls')
const debugE = require('debug')('poll:error::db:urls')
const _ = require('lodash')
const {v4: uuidv4} = require('uuid')

var mysql

const KEYS = ['poll_run_id', 'poll_user_id', 'uuid']

async function get(query) {
  if (!query.id && !query.uuid) {
    throw new Error('id or uuid required')
  }
  let prop, val
  if (query.id) {
    prop = 'id'
    val = query.id
  }
  if (query.uuid) {
    prop = 'uuid'
    val = query.uuid
  }

  let sql = `select * from urls where ${prop} = ?`
  let u = await mysql(sql, [val])
  if (u && u.length) {
    u = u[0]
  } else if (u.length === 0) {
    return undefined
  }
  return u
}

async function create(url) {
  debug('create', JSON.stringify(url))
  if (!url) {
    throw new Error('url attributes required')
  }
  if (!_.has(url, 'uuid')) {
    url.uuid = uuidv4()
  }
  let keys = []
  let values = []

  KEYS.forEach(key => {
    if (_.has(url, key)) {
      keys.push(key)
      values.push(url[key])
    }
  })

  let sql = 'insert into urls (' + keys.join(', ') + ') values (' + values.map(() => '?').join(', ') + ')'

  let r = await mysql(sql, values)
  url = {id: r.insertId, ...url}
  return url
}
async function update(url) {
  if (!url || !url.id) {
    throw new Error('id required')
  }
  if (!url && !url.id) {
    throw new Error('id required')
  }

  let keys = []
  let values = []

  let sql = ''

  KEYS.forEach(key => {
    if (url[key]) {
      if (sql.length) sql += ', '
      sql += key + '= ? '
      values.push(url[key])
    }
  })

  sql = 'update urls set ' + sql + ' where id = ?'

  values.push(url.id)
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

  let sql = `delete from urls where ${prop} = ? limit 1`
  return await mysql(sql, [val])
}

async function init(config) {
  debug('init')
  mysql = config.execute
}

module.exports = {init, create, get, update, del}

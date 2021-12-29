'use strict'

const debug = require('debug')('dt:db:keyvals')
const debugE = require('debug')('dt:error::db:keyvals')
const _ = require('lodash')

var mysql

async function get(id) {
  if (!id) {
    throw new Error('id required')
  }
  let sql = 'select * from keyvals where id = ?'
  let values = [id]
  let result = await mysql(sql, values)
  if (0 === result.length) return undefined

  let out = {}

  out.id = _.get(result, '[0].id')
  out.dt = _.get(result, '[0].dt')
  out.val = _.get(result, '[0].data')
  if (out.val) out.val = out.val.toString()

  try {
    // JSON.parse converts '123' to Number(123), interestingly...
    let tmp = JSON.parse(out.val)
    out.val = tmp
    // Don't support numbers. Cant distinguish between text and nums so just ignore nums for now
    if ('number' == typeof out.val) {
      out.val += ''
    }
  } catch (e) {
    //debugE('get', e)
  }

  return out
}
async function set(id, data) {
  if (!id) {
    throw new Error('id required')
  }

  if (!data) {
    throw new Error('val required')
  }

  try {
    let json = JSON.stringify(data)
    let obj = JSON.parse(json)
    let isArray = Array.isArray(obj)
    let isObject = (typeof obj === 'object' || typeof obj === 'function') && obj !== null
    json = isArray || isObject ? 1 : 0
    if (json) data = JSON.stringify(data)
  } catch (e) {
    debug('set', data, e)
  }

  let sql = 'insert into keyvals (id,data) values (?, ?) on duplicate key update data = ?'
  let values = [id, data, data]

  let r = await mysql(sql, values)
  return {id, data}
}

async function del(id) {
  if (!id) {
    throw new Error('id required')
  }
  let sql = 'delete from keyvals where id= ?'
  let values = [id]
  return await mysql(sql, values)
}
async function init(config) {
  debug('init')
  mysql = config.execute
}

module.exports = {init, get, set, del}

//const nodeMailer = require('nodemailer')
const crypto = require('crypto')
const debug = require('debug')('poll:utils')
const debugE = require('debug')('poll:error:utils')
exports.notify = function (data) {
  debug('notify:', JSON.stringify(data))
  // if (data.email) exports.sendMail(data)
  // if (data.phone) exports.sendSMS(data)
  return Promise.resolve(true)
}

exports.generateRandomString = function (length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'

  return Array(length)
    .fill(0)
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join('')
}

exports.generateRandomNumber = function (length = 32) {
  const chars = '1234567890'

  let string = Array(length)
    .fill(0)
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join('')
  return parseInt(string)
}

exports.stringify = function (value) {
  // stringify for error objects
  function adapter(key, value) {
    try {
      if (value instanceof Error) {
        return {
          // Pull all enumerable properties, supporting properties on custom Errors
          ...value,
          // Explicitly pull Error's non-enumerable properties
          name: value.name,
          message: value.message,
          stack: value.stack
        }
      }
      return value
    } catch (e) {
      debugE('amply-util stringify error', e)
    }
    return value
  }
  try {
    return JSON.stringify(value, adapter)
  } catch (e) {
    debugE('amply-util stringify error', e)
  }
  return value
}

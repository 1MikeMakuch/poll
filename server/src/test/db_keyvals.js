/* global describe, it, before, after afterEach */

const chai = require('chai')
const db = require('../db')
const debug = require('debug')('poll:test:db')
const debugE = require('debug')('poll:error:db')
const process = require('process')
const utils = require('../utils')

chai.use(require('chai-http'))

const expect = chai.expect

before('init db', async function () {
  await db.init()
})

describe('db', async function () {
  it('keyvals', async function () {
    const id0 = 'test00000000000'
    let data = 'xyzzy'

    let r = await db.keyvals.set(id0, data)

    expect(r.id).to.equal(id0)
    expect(r.data).to.equal(data)

    r = await db.keyvals.get(id0)
    expect(r.id).to.equal(id0)
    expect(r.val).to.equal(data)

    let id1 = 'test9999999999999999'
    r = null
    try {
      r = await db.keyvals.get(id1)
    } catch (e) {
      expect(false).to.be.true
    }
    expect(r).to.be.undefined

    try {
      r = await db.keyvals.set(null, data)
      expect(false).to.be.true
    } catch (e) {
      expect(e.message).to.equal('id required')
    }
    expect(r).to.be.undefined

    try {
      r = await db.keyvals.set(id1, null)
      expect(false).to.be.true
    } catch (e) {
      expect(e.message).to.equal('val required')
    }
    expect(r).to.be.undefined

    try {
      r = await db.keyvals.del(null)
    } catch (e) {
      expect(e.message).to.equal('id required')
    }
    expect(r).to.be.undefined

    try {
      r = await db.keyvals.del(id0)
    } catch (e) {
      expect(false).to.equal(true)
    }
    expect(r.affectedRows).to.equal(1)

    r = null
    try {
      r = await db.keyvals.get(id0)
      expect(false).to.be.true
    } catch (e) {
      //
    }
    expect(r).to.be.undefined
  })
})

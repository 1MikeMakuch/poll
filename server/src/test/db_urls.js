/* global describe, it, before, after afterEach */

const chai = require('chai')
const db = require('../db')
const debug = require('debug')('poll:test:db')
const debugE = require('debug')('poll:error:db')
const process = require('process')
const utils = require('../utils')
const {v4: uuidv4} = require('uuid')

chai.use(require('chai-http'))

const expect = chai.expect

before('init db', async function () {
  await db.init()
})

describe('db', async function () {
  it('urls', async function () {
    let url = {
      user_id: 123,
      poll_run_id: 123
    }

    // create

    url = await db.urls.create(url)
    let id = url.id

    expect(url.uuid).to.be.not.null
    expect(url.uuid.length).to.be.gt(5)

    // read
    r = await db.urls.get({id})

    expect(r.id).to.equal(id)
    expect(r.user_id).to.equal(url.user_id)
    expect(r.poll_run_id).to.equal(url.poll_run_id)

    // update by id
    url.uuid = uuidv4()
    r = await db.urls.update({id, uuid: url.uuid})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was updated
    r = await db.urls.get({id})
    expect(r.id).to.equal(id)
    expect(r.user_id).to.equal(url.user_id)
    expect(r.poll_run_id).to.equal(url.poll_run_id)
    expect(r.uuid).to.equal(url.uuid)

    // delete
    r = await db.urls.del({id: url.id})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was deleted
    r = await db.urls.get({id: url.id})
    expect(r).to.be.undefined
  })
})

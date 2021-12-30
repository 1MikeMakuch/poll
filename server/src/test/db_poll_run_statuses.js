/* global describe, it, before, after afterEach */

const chai = require('chai')
const db = require('../db')
const debug = require('debug')('poll:test:db:poll_run_statuses')
const debugE = require('debug')('poll:error:db:poll_run_statuses')
const process = require('process')
const utils = require('../utils')

chai.use(require('chai-http'))

const expect = chai.expect

before('init db', async function () {
  await db.init()
})

const KEYS = ['id', 'poll_run_id', 'poll_user_id', 'status']

describe('db', async function () {
  it('poll_run_statuses', async function () {
    let poll_run_status = {
      poll_run_id: utils.generateRandomNumber(6),
      poll_user_id: utils.generateRandomNumber(6),
      status: 'sent'
    }

    // create

    poll_run_status = await db.poll_run_statuses.create(poll_run_status)

    let id = poll_run_status.id

    // read
    r = await db.poll_run_statuses.get({id})
    debug('r=', JSON.stringify(r))
    expect(r.id).to.equal(id)

    KEYS.forEach(key => {
      expect(r[key]).to.equal(poll_run_status[key])
    })

    // update by id
    poll_run_status.status = 'viewed'
    r = await db.poll_run_statuses.update({
      poll_run_id: poll_run_status.poll_run_id,
      poll_user_id: poll_run_status.poll_user_id,
      status: poll_run_status.status
    })
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was updated
    r = await db.poll_run_statuses.get({id})

    KEYS.forEach(key => {
      expect(r[key]).to.equal(poll_run_status[key])
    })

    // delete
    r = await db.poll_run_statuses.del({id: poll_run_status.id})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was deleted
    r = await db.poll_run_statuses.get({id: poll_run_status.id})
    expect(r).to.be.undefined
  })
})

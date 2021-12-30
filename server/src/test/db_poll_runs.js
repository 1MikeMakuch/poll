/* global describe, it, before, after afterEach */

const chai = require('chai')
const db = require('../db')
const debug = require('debug')('poll:test:db:poll_runs')
const debugE = require('debug')('poll:error:db:poll_runs')
const process = require('process')
const utils = require('../utils')

chai.use(require('chai-http'))

const expect = chai.expect

before('init db', async function () {
  await db.init()
})

const KEYS = ['id', 'poll_id']

describe('db', async function () {
  it('poll_runs', async function () {
    let poll_run = {
      poll_id: utils.generateRandomNumber(6)
    }

    // create

    poll_run = await db.poll_runs.create(poll_run)

    let id = poll_run.id

    // read
    r = await db.poll_runs.get({id})
    debug('r=', JSON.stringify(r))
    expect(r.id).to.equal(id)

    KEYS.forEach(key => {
      debug('created', key, JSON.stringify({r, poll_run}))
      expect(r[key]).to.equal(poll_run[key])
    })

    // update by id
    poll_run.poll_run = 'no'
    r = await db.poll_runs.update({id, poll_id: poll_run.poll_id})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was updated
    r = await db.poll_runs.get({id})

    KEYS.forEach(key => {
      debug('updated', key, JSON.stringify({r, poll_run}))
      expect(r[key]).to.equal(poll_run[key])
    })

    // delete
    r = await db.poll_runs.del({id: poll_run.id})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was deleted
    r = await db.poll_runs.get({id: poll_run.id})
    expect(r).to.be.undefined
  })
})

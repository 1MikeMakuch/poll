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

const KEYS = ['id', 'tenant_id', 'name', 'description']

describe('db', async function () {
  it('polls', async function () {
    let poll = {
      tenant_id: utils.generateRandomNumber(6),
      name: 'Twisty little maze',
      description: '.. passages all alike'
    }

    // create

    poll = await db.polls.create(poll)

    let id = poll.id

    // read
    r = await db.polls.get({id})
    debug('r=', JSON.stringify(r))
    expect(r.id).to.equal(id)

    KEYS.forEach(key => {
      expect(r[key]).to.equal(poll[key])
    })

    // update by id
    poll.poll = 'no'
    r = await db.polls.update({id, poll: poll.poll})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was updated
    r = await db.polls.get({id})

    KEYS.forEach(key => {
      expect(r[key]).to.equal(poll[key])
    })

    // delete
    r = await db.polls.del({id: poll.id})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was deleted
    r = await db.polls.get({id: poll.id})
    expect(r).to.be.undefined
  })
})

/* global describe, it, before, after afterEach */

const chai = require('chai')
const db = require('../db')
const debug = require('debug')('poll:test:db:poll_users')
const debugE = require('debug')('poll:error:db:poll_users')
const process = require('process')
const utils = require('../utils')

chai.use(require('chai-http'))

const expect = chai.expect

before('init db', async function () {
  await db.init()
})

const KEYS = ['id', 'poll_id', 'email', 'first_name', 'last_name', 'phone']

describe('db', async function () {
  it('poll_users', async function () {
    let poll_user = {
      tenant_id: utils.generateRandomNumber(6),
      poll_id: utils.generateRandomNumber(6),
      email: 'miketesting+' + utils.generateRandomString(5) + '@bryllyant.com',
      first_name: 'Mike',
      last_name: 'User',
      phone: utils.generateRandomString(10)
    }

    // create

    poll_user = await db.poll_users.create(poll_user)

    let id = poll_user.id

    // read
    r = await db.poll_users.get({id})
    debug('r=', JSON.stringify(r))
    expect(r.id).to.equal(id)

    debug('get', JSON.stringify({poll_user, r}))

    KEYS.forEach(key => {
      debug('get', key)
      expect(r[key]).to.equal(poll_user[key])
    })

    // update by id
    poll_user.poll_id = utils.generateRandomNumber(6)
    r = await db.poll_users.update({id, poll_id: poll_user.poll_id})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was updated
    r = await db.poll_users.get({id})

    KEYS.forEach(key => {
      expect(r[key]).to.equal(poll_user[key])
    })

    // delete
    r = await db.poll_users.del({id: poll_user.id})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was deleted
    r = await db.poll_users.get({id: poll_user.id})
    expect(r).to.be.undefined
  })
})

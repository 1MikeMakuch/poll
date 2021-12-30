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
  it('users', async function () {
    let user = {
      name: 'Mike',
      email: 'miketesting+' + utils.generateRandomString(5) + '@bryllyant.com',
      tenant_id: 123,
      password: 'xyzzy',
      is_admin: 0
    }

    // create

    user = await db.users.create(user)

    let id = user.id

    // read
    r = await db.users.get({id})

    expect(r.id).to.equal(id)
    expect(r.email).to.equal(user.email)
    expect(r.name).to.equal(user.name)
    expect(r.tenant_id).to.equal(user.tenant_id)
    expect(r.password).to.equal(user.password)
    expect(r.is_admin).to.equal(user.is_admin)

    // update by id
    user.email = 'xyzzy@plugh.xyz'
    r = await db.users.update({id, email: user.email})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was updated
    r = await db.users.get({id})
    expect(r.id).to.equal(id)
    expect(r.email).to.equal(user.email)
    expect(r.name).to.equal(user.name)

    // update by email
    user.name = 'Sally User'
    r = await db.users.update({id, name: user.name})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was updated read by email
    r = await db.users.get({email: user.email})
    expect(r.id).to.equal(id)
    expect(r.email).to.equal(user.email)
    expect(r.name).to.equal(user.name)

    let user0 = Object.assign({}, user)

    // create 1 more
    let user1 = Object.assign({}, user)
    user1.email = 'plugh@xyzzy.xyz'
    delete user1.id
    user1 = await db.users.create(user1)

    // delete
    r = await db.users.del({id: user0.id})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was deleted
    r = await db.users.get({id: user0.id})
    expect(r).to.be.undefined

    // delete by email
    r = await db.users.del({email: user1.email})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was deleted
    r = await db.users.get({email: user1.email})
    expect(r).to.be.undefined
  })
})

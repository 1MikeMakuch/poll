/* global describe, it, before, after afterEach */

const process = require('process')
const chai = require('chai')
const db = require('../db')
const debug = require('debug')('poll:test:api_users')
const debugE = require('debug')('poll:error:api_users')
const utils = require('../utils')

chai.use(require('chai-http'))

const expect = chai.expect

const request = chai.request(process.env.TEST_URL)

before('init db', async function () {
  //
  await db.init()
})
after('cleanup', async function () {
  try {
    await db.users.del({email: user0.email})
    await db.users.del({email: user1.email})
  } catch (e) {}
})
describe('api', async function () {
  it('users', async function () {
    let user2 = {
      name: 'Mike User',
      email: 'miketesting+' + utils.generateRandomString(5) + '@1mikemakuch.com'
    }

    // create user
    let r = await request.post('/api/users').send(user2)
    expect(r.status).to.equal(201)
    expect(r.body.name).to.equal(user2.name)
    expect(r.body.emai).to.equal(user2.emai)
    user2 = Object.assign({}, r.body)
    debug('user2 created id', user2.id)

    // can't create duplicate
    r = await request.post('/api/users').send(user2)
    expect(r.status).to.equal(400)
    debug('user didnt create', JSON.stringify(r.body))

    // read it by id
    r = await request.get(`/api/users/${user2.id}`)
    expect(r.status).to.equal(200)
    expect(r.body.name).to.equal(user2.name)
    expect(r.body.emai).to.equal(user2.emai)

    // update by id
    user2.name = 'Sally User'
    r = await request.put(`/api/users/${user2.id}`).send({name: user2.name})
    expect(r.status).to.equal(201)

    // read/verify the update by id
    r = await request.get(`/api/users/${user2.id}`)
    expect(r.status).to.equal(200)
    expect(r.body.name).to.equal(user2.name)
    expect(r.body.emai).to.equal(user2.emai)

    // create 2nd user
    let user3 = Object.assign({}, user2)
    user3.email = 'miketesting+' + utils.generateRandomString(5) + '@1mikemakuch.com'
    delete user3.id
    r = await request.post('/api/users').send(user3)

    user3.id = r.id

    expect(r.status).to.equal(201)
    expect(r.body.name).to.equal(user3.name)
    expect(r.body.email).to.equal(user3.email)
    user3 = Object.assign({}, r.body)
    debug('user3 created id', user3.id)

    // delete user2
    r = await request.delete(`/api/users/${user2.id}`)
    expect(r.status).to.equal(200)
    debug('delete user', user2.id)

    // check it's gone
    r = await request.get(`/api/users/${user2.id}`)
    expect(r.status).to.equal(404)
    debug('check its deleted')

    // delete user3
    r = await request.delete(`/api/users/${user3.id}`)
    expect(r.status).to.equal(200)
    debug('deleted user', user3.id)

    // check it's gone
    r = await request.get(`/api/users/${user3.id}`)
    expect(r.status).to.equal(404)
    debug('check its deleted')
  })
})

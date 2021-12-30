/* global describe, it, before, after afterEach */

const process = require('process')
const chai = require('chai')
const db = require('../db')
const debug = require('debug')('poll:test:api_poll_users')
const debugE = require('debug')('poll:error:api_poll_poll_users')
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
    await db.poll_users.del({email: poll_user0.email})
    await db.poll_users.del({email: poll_user1.email})
  } catch (e) {}
})
describe('api', async function () {
  const KEYS = ['poll_id', 'email', 'first_name', 'last_name', 'phone']

  it('poll_users', async function () {
    let poll_user2 = {
      tenant_id: utils.generateRandomNumber(6),
      first_name: 'Joe',
      last_name: 'User',
      email: 'mike+testing-' + utils.generateRandomString(6) + '@example.com',
      phone: '123-123-1232',
      poll_id: utils.generateRandomNumber(6)
    }

    // create poll_user
    let r = await request.post('/api/poll_users').send(poll_user2)
    expect(r.status).to.equal(201)
    debug('post r=', JSON.stringify(r.body))
    poll_user2.id = r.body.id

    KEYS.forEach(key => {
      debug('key', key)
      expect(r.body[key]).to.equal(poll_user2[key])
    })
    // expect(r.body.first_name).to.equal(poll_user2.first_name)
    // expect(r.body.emai).to.equal(poll_user2.emai)

    poll_user2 = Object.assign({}, r.body)
    debug('poll_user2 created id', poll_user2.id)

    // can't create duplicate
    // r = await request.post('/api/poll_users').send(poll_user2)
    // expect(r.status).to.equal(400)
    // debug('poll_user didnt create', JSON.stringify(r.body))

    // read it by id
    r = await request.get(`/api/poll_users/${poll_user2.id}`)
    expect(r.status).to.equal(200)

    expect(r.body.first_name).to.equal(poll_user2.first_name)
    expect(r.body.emai).to.equal(poll_user2.emai)

    // update by id
    poll_user2.first_name = 'Sally'
    r = await request.put(`/api/poll_users/${poll_user2.id}`).send({first_name: poll_user2.first_name})
    expect(r.status).to.equal(201)

    // read/verify the update by id
    r = await request.get(`/api/poll_users/${poll_user2.id}`)
    expect(r.status).to.equal(200)

    KEYS.forEach(key => {
      expect(r.body[key]).to.equal(poll_user2[key])
    })

    // expect(r.body.first_name).to.equal(poll_user2.first_name)
    // expect(r.body.emai).to.equal(poll_user2.emai)

    // create 2nd poll_user
    let poll_user3 = Object.assign({}, poll_user2)
    ;(poll_user3.email = 'mike+testing-' + utils.generateRandomString(6) + '@example.com'), delete poll_user3.id
    r = await request.post('/api/poll_users').send(poll_user3)

    poll_user3.id = r.id

    expect(r.status).to.equal(201)

    KEYS.forEach(key => {
      expect(r.body[key]).to.equal(poll_user3[key])
    })

    // expect(r.body.first_name).to.equal(poll_user3.first_name)
    // expect(r.body.email).to.equal(poll_user3.email)

    poll_user3 = Object.assign({}, r.body)
    debug('poll_user3 created id', poll_user3.id)

    // delete poll_user2
    r = await request.delete(`/api/poll_users/${poll_user2.id}`)
    expect(r.status).to.equal(200)
    debug('delete poll_user', poll_user2.id)

    // check it's gone
    r = await request.get(`/api/poll_users/${poll_user2.id}`)
    expect(r.status).to.equal(404)
    debug('check its deleted')

    // delete poll_user3
    r = await request.delete(`/api/poll_users/${poll_user3.id}`)
    expect(r.status).to.equal(200)
    debug('deleted poll_user', poll_user3.id)

    // check it's gone
    r = await request.get(`/api/poll_users/${poll_user3.id}`)
    expect(r.status).to.equal(404)
    debug('check its deleted')
  })
})

/* global describe, it, before, after afterEach */

const process = require('process')
const chai = require('chai')
const db = require('../db')
const debug = require('debug')('poll:test:api_polls')
const debugE = require('debug')('poll:error:api_poll_polls')
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
    await db.polls.del({email: poll0.email})
    await db.polls.del({email: poll1.email})
  } catch (e) {}
})
describe('api_polls', async function () {
  const KEYS = ['poll_id', 'email', 'first_name', 'last_name', 'phone']

  it('polls', async function () {
    let poll2 = {
      first_name: 'Joe',
      last_name: 'User',
      email: 'mike+testing_' + utils.generateRandomString(6) + '@bryllyant.com',
      phone: '123-123-1232',
      poll_id: utils.generateRandomNumber(6)
    }

    // create poll
    let r = await request.post('/api/polls').send(poll2)
    expect(r.status).to.equal(201)
    debug('post r=', JSON.stringify(r.body))
    poll2.id = r.body.id

    KEYS.forEach(key => {
      debug('key', key)
      expect(r.body[key]).to.equal(poll2[key])
    })
    // expect(r.body.first_name).to.equal(poll2.first_name)
    // expect(r.body.emai).to.equal(poll2.emai)

    poll2 = Object.assign({}, r.body)
    debug('poll2 created id', poll2.id)

    // can't create duplicate
    // r = await request.post('/api/polls').send(poll2)
    // expect(r.status).to.equal(400)
    // debug('poll didnt create', JSON.stringify(r.body))

    // read it by id
    r = await request.get(`/api/polls/${poll2.id}`)
    expect(r.status).to.equal(200)

    expect(r.body.first_name).to.equal(poll2.first_name)
    expect(r.body.emai).to.equal(poll2.emai)

    // update by id
    poll2.first_name = 'Sally'
    r = await request.put(`/api/polls/${poll2.id}`).send({first_name: poll2.first_name})
    expect(r.status).to.equal(201)

    // read/verify the update by id
    r = await request.get(`/api/polls/${poll2.id}`)
    expect(r.status).to.equal(200)

    KEYS.forEach(key => {
      expect(r.body[key]).to.equal(poll2[key])
    })

    // expect(r.body.first_name).to.equal(poll2.first_name)
    // expect(r.body.emai).to.equal(poll2.emai)

    // create 2nd poll
    let poll3 = Object.assign({}, poll2)
    poll3.email = 'joe1@example.com'
    r = await request.post('/api/polls').send(poll3)
    debug('\n\npoll3 r=', JSON.stringify(r.body), '\n')
    poll3.id = r.id

    expect(r.status).to.equal(201)

    KEYS.forEach(key => {
      expect(r.body[key]).to.equal(poll3[key])
    })

    // expect(r.body.first_name).to.equal(poll3.first_name)
    // expect(r.body.email).to.equal(poll3.email)

    poll3 = Object.assign({}, r.body)
    debug('poll3 created id', poll3.id)

    // delete poll2
    r = await request.delete(`/api/polls/${poll2.id}`)
    expect(r.status).to.equal(200)
    debug('delete poll', poll2.id)

    // check it's gone
    r = await request.get(`/api/polls/${poll2.id}`)
    expect(r.status).to.equal(404)
    debug('check its deleted')

    // delete poll3
    r = await request.delete(`/api/polls/${poll3.id}`)
    expect(r.status).to.equal(200)
    debug('deleted poll', poll3.id)

    // check it's gone
    r = await request.get(`/api/polls/${poll3.id}`)
    expect(r.status).to.equal(404)
    debug('check its deleted')
  })
})

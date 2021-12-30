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
    // await db.polls.del({email: poll0.email})
    // await db.polls.del({email: poll1.email})
  } catch (e) {}
})
describe('api', async function () {
  //

  const KEYS = ['tenant_id', 'name', 'description']

  it('polls', async function () {
    let poll0 = {
      tenant_id: utils.generateRandomNumber(6),
      name: utils.generateRandomString(10),
      description: utils.generateRandomString(20)
    }

    // create poll
    let r = await request.post('/api/polls').send(poll0)
    expect(r.status).to.equal(201)
    debug('post r=', JSON.stringify(r.body))
    poll0.id = r.body.id

    KEYS.forEach(key => {
      expect(r.body[key]).to.equal(poll0[key])
    })

    poll0 = Object.assign({}, r.body)
    debug('poll0 created id', poll0.id)

    // can't create duplicate
    // r = await request.post('/api/polls').send(poll2)
    // expect(r.status).to.equal(400)
    // debug('poll didnt create', JSON.stringify(r.body))

    // read it by id
    r = await request.get(`/api/polls/${poll0.id}`)
    expect(r.status).to.equal(200)

    KEYS.forEach(key => {
      expect(r.body[key]).to.equal(poll0[key])
    })

    // update by id
    poll0.name = 'Sally'
    r = await request.put(`/api/polls/${poll0.id}`).send({id: poll0.id, name: poll0.name})
    expect(r.status).to.equal(201)

    // read/verify the update by id
    r = await request.get(`/api/polls/${poll0.id}`)
    expect(r.status).to.equal(200)

    KEYS.forEach(key => {
      expect(r.body[key]).to.equal(poll0[key])
    })

    // create 2nd poll
    let poll1 = Object.assign({}, poll0)
    delete poll1.id
    r = await request.post('/api/polls').send(poll1)
    debug('poll1 r=', JSON.stringify(r.body))
    poll1.id = r.id

    expect(r.status).to.equal(201)

    KEYS.forEach(key => {
      expect(r.body[key]).to.equal(poll1[key])
    })

    poll1 = Object.assign({}, r.body)
    debug('poll1 created id', poll1.id)

    // delete poll0
    r = await request.delete(`/api/polls/${poll0.id}`)
    expect(r.status).to.equal(200)
    debug('delete poll0', poll0.id)

    // check it's gone
    r = await request.get(`/api/polls/${poll0.id}`)
    expect(r.status).to.equal(404)

    // delete poll1
    r = await request.delete(`/api/polls/${poll1.id}`)
    expect(r.status).to.equal(200)
    debug('deleted poll1', poll1.id)

    // check it's gone
    r = await request.get(`/api/polls/${poll1.id}`)
    expect(r.status).to.equal(404)
  })
})

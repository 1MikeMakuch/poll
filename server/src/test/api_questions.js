/* global describe, it, before, after afterEach */

const process = require('process')
const chai = require('chai')
//const db = require('../db')
const debug = require('debug')('poll:test:api_questions')
const debugE = require('debug')('poll:error:api_questions')
const utils = require('../utils')

chai.use(require('chai-http'))

const expect = chai.expect

const request = chai.request(process.env.TEST_URL)

before('', async function () {
  //
  //await db.init()
})
after('cleanup', async function () {
  try {
  } catch (e) {}
})
describe('api', async function () {
  //
  const KEYS = ['poll_id', 'poll_run_id', 'question_id', 'question']

  it('api_questions', async function () {
    //

    let question = {
      poll_id: utils.generateRandomNumber(6),
      poll_run_id: utils.generateRandomNumber(6),
      question_id: 1,
      question: 'why is the sky blue?'
    }

    // create question
    let r = await request.post('/api/questions').send(question)
    expect(r.status).to.equal(201)
    question.id = r.body.id
    KEYS.forEach(key => {
      expect(r.body[key]).to.equal(question[key])
    })

    // read it by id
    r = await request.get(`/api/questions/${question.id}`)
    expect(r.status).to.equal(200)
    KEYS.forEach(key => {
      expect(r.body[key]).to.equal(question[key])
    })

    // update by id
    question.question = 'what?'
    r = await request.put(`/api/questions/${question.id}`).send({question: question.question})
    expect(r.status).to.equal(201)

    // read/verify the update by id
    r = await request.get(`/api/questions/${question.id}`)
    expect(r.status).to.equal(200)
    KEYS.forEach(key => {
      expect(r.body[key]).to.equal(question[key])
    })

    // delete question
    r = await request.delete(`/api/questions/${question.id}`)
    expect(r.status).to.equal(200)

    // check it's gone
    r = await request.get(`/api/questions/${question.id}`)
    expect(r.status).to.equal(404)
  })
})

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
  it('questions', async function () {
    let question = {
      question_id: utils.generateRandomNumber(8),
      poll_run_id: utils.generateRandomNumber(8),
      question: 'plugh'
    }

    // create

    question = await db.questions.create(question)

    let id = question.id

    // read
    r = await db.questions.get({id})

    expect(r.id).to.equal(id)
    expect(r.question_id).to.equal(question.question_id)
    expect(r.poll_run_id).to.equal(question.poll_run_id)
    expect(r.question).to.equal(question.question)

    // update by id
    question.question = 'no'
    r = await db.questions.update({id, question: question.question})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was updated
    r = await db.questions.get({id})
    expect(r.id).to.equal(id)
    expect(r.question_id).to.equal(question.question_id)
    expect(r.poll_run_id).to.equal(question.poll_run_id)
    expect(r.question).to.equal(question.question)

    // delete
    r = await db.questions.del({id: question.id})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was deleted
    r = await db.questions.get({id: question.id})
    expect(r).to.be.undefined
  })
})

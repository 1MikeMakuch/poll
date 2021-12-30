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
  it('answers', async function () {
    let answer = {
      poll_user_id: 123,
      poll_run_id: 123,
      answer: 'yes'
    }

    // create

    answer = await db.answers.create(answer)

    let id = answer.id

    // read
    r = await db.answers.get({id})

    expect(r.id).to.equal(id)
    expect(r.poll_user_id).to.equal(answer.poll_user_id)
    expect(r.poll_run_id).to.equal(answer.poll_run_id)
    expect(r.answer).to.equal(answer.answer)

    // update by id
    answer.answer = 'no'
    r = await db.answers.update({id, answer: answer.answer})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was updated
    r = await db.answers.get({id})
    expect(r.id).to.equal(id)
    expect(r.poll_user_id).to.equal(answer.poll_user_id)
    expect(r.poll_run_id).to.equal(answer.poll_run_id)
    expect(r.answer).to.equal(answer.answer)

    // delete
    r = await db.answers.del({id: answer.id})
    expect(r.affectedRows).to.equal(1)
    expect(r.warningStatus).to.equal(0)

    // confirm it was deleted
    r = await db.answers.get({id: answer.id})
    expect(r).to.be.undefined
  })
})

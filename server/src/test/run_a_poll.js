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
    // await db.poll_users.del({email: poll_user0.email})
    // await db.poll_users.del({email: poll_user1.email})
  } catch (e) {}
})
describe('run', async function () {
  //const KEYS = ['poll_id', 'email', 'first_name', 'last_name', 'phone']

  it('run_a_poll', async function () {
    this.timeout(5000)
    //
    // create an admin user
    //

    // Completely bypassing authentication and authorization here.
    // admin priv would need to be granted one way or another or

    let admin = {
      tenant_id: utils.generateRandomNumber(6),
      email: 'mike+test+admin-' + utils.generateRandomString(5) + '@example.com',
      name: 'Mike Tester',
      is_admin: 1
    }
    const tenant_id = admin.tenant_id

    let r = await request.post('/api/users').send(admin)
    expect(r.status).to.equal(201)
    admin.id = r.body.id

    // Bypassing authentication
    // No auth needed, just manually setting tenant_id for the poll_users.
    // In prod the client sends in an encrypted token with user_id, the api/db layers
    // decode the token and the tenant_id is looked up in the db.

    // Create a poll

    let poll = {
      tenant_id,
      name: 'Poll 0',
      description: 'Test poll 0'
    }
    r = await request.post('/api/polls').send(poll)
    expect(r.status).to.equal(201)
    poll.id = r.body.id
    poll_id = poll.id

    let poll_user0 = {
      tenant_id,
      poll_id,
      first_name: 'Joe0',
      last_name: 'User0',
      email: 'joe0+testing-' + utils.generateRandomString(6) + '@example.com',
      phone: '123-123-1232'
    }

    // create poll_user

    r = await request.post('/api/poll_users').send(poll_user0)
    expect(r.status).to.equal(201)
    poll_user0.id = r.body.id

    // create 2nd poll_user

    poll_user1 = JSON.parse(JSON.stringify(poll_user0))
    poll_user1.first_name = 'Joe1'
    poll_user1.last_name = 'User1'
    poll_user1.email = 'joe1+testing-' + utils.generateRandomString(6) + '@example.com'
    poll_user1.phone = '321-321-3211'

    r = await request.post('/api/poll_users').send(poll_user1)
    expect(r.status).to.equal(201)
    poll_user1.id = r.body.id

    // Create questions
    // Questions are assigned a poll (poll_id)

    let questions = [
      {
        poll_id,
        question_id: 1,
        question: 'How do you do?'
      },
      {
        poll_id,
        question_id: 2,
        question: 'How are you feeling today?'
      },
      {
        poll_id,
        question_id: 3,
        question: 'Why?'
      }
    ]
    for (let i = 0; i < questions.length; i++) {
      r = await request.post('/api/questions').send(questions[i])
      expect(r.status).to.equal(201)
      questions[i].id = r.body.id
    }

    // run the poll
    let poll_run = {
      poll_id,
      poll_user_ids: [poll_user0.id, poll_user1.id]
    }
    r = await request.post('/api/poll_runs').send(poll_run)
    expect(r.status).to.equal(201)

    // the poll has been "run" once, that is the users have been notified
    // now each user answers

    // cheating here, the post above is returning the poll_users
    // UUID so we can simulate the poll taking directly right here, instead of getting an email

    const poll_users = r.body

    const answers = ['yes', 'no']
    let url,
      i = 1

    // 1st user answers all 3 yes, in correct order

    url = '/api/poll_run_answer/' + poll_users[0].uuid.uuid + '/1/yes'
    r = await request.post(url)
    expect(r.status).to.equal(201)

    await new Promise(resolve => setTimeout(resolve, 1005))

    url = '/api/poll_run_answer/' + poll_users[0].uuid.uuid + '/2/yes'
    r = await request.post(url)
    expect(r.status).to.equal(201)

    await new Promise(resolve => setTimeout(resolve, 1005))

    url = '/api/poll_run_answer/' + poll_users[0].uuid.uuid + '/3/yes'
    r = await request.post(url)

    // 2nd user answers out of order

    url = '/api/poll_run_answer/' + poll_users[1].uuid.uuid + '/3/yes'
    r = await request.post(url)
    expect(r.status).to.equal(400)

    url = '/api/poll_run_answer/' + poll_users[1].uuid.uuid + '/2/yes'
    r = await request.post(url)
    expect(r.status).to.equal(400)

    // this one is accepted

    url = '/api/poll_run_answer/' + poll_users[1].uuid.uuid + '/1/yes'
    r = await request.post(url)
    expect(r.status).to.equal(201)

    //
  })
})

/* global describe, it, before, after afterEach */

const process = require('process')
const chai = require('chai')
const db = require('../db')
const debug = require('debug')('dt:test:apis')
const debugE = require('debug')('dt:error:apis')
const utils = require('../utils')

chai.use(require('chai-http'))

const expect = chai.expect

const request = chai.request(process.env.TEST_URL)

let auths = [null, null],
  auth0,
  auth1,
  users = [null, null],
  user0,
  user1

async function login() {
  user0 = {
    name: 'Joe User',
    email: 'joe@example.com'
  }
  user1 = {
    name: 'Sally User',
    email: 'sally@example.com'
  }
  users = [user0, user1]
  await db.users.del({email: user0.email})

  for (var u = 0; u < 2; u++) {
    // request login link
    debug('/api/requestLoginLink', JSON.stringify(users[u]))
    let r = await request.post('/api/requestLoginLink').send(users[u]).redirects(0)
    expect(r.status).to.equal(200)

    // For dev only the token is included in the body for ENV=development only, so we can grab it and use it for testing.
    debug('token', JSON.stringify(r.body))
    let token = r.body?.dev['x-dollahite-tapes-app']

    expect(String(token).length).to.be.gt(0)

    // now login with the token
    r = await request.get('/api/login?token=' + token).redirects(0)
    expect(r.status).to.equal(200)
    debug('auth cookie', r.headers['set-cookie'][0])
    let cookie = r.headers['set-cookie'][0].replace(/;.*/, '')
    auths[u] = {cookie}
    users[u] = r.body
    debug('user', JSON.stringify(users[u]))
  }
  auth0 = auths[0]
  auth1 = auths[1]
  user0 = users[0]
  user1 = users[1]
  debug('logins', JSON.stringify({users, auths}))
}

before('init db', async function () {
  //
  await db.init()
  await login()
})
after('cleanup', async function () {
  await db.users.del({email: user0.email})
  await db.users.del({email: user1.email})
})
describe('api', async function () {
  it('isLoggedIn', async function () {
    let r = await request.get('/api/isLoggedIn').set(auth0)
    expect(r.status).to.equal(200)
    expect(r.body.id).to.equal(user0.id)
  })
  it('comments', async function () {
    let mp3 = 'test=' + utils.generateRandomString(10)
    let comments = 'this is a test'

    // create a comment
    let r = await request.post(`/api/comments/${mp3}`).send({comments}).set(auth0)

    expect(r.status).to.equal(201)
    debug('comment created', r.status)

    // read it
    r = await request.get(`/api/comments/${mp3}`).set(auth0)
    expect(r.status).to.equal(200)
    expect(r.body.length).to.be.gt(0)
    expect(r.body.find(comment => comments === comment.data).data).to.equal(comments)
    let ids = r.body.map(comment => comment.id)

    let id = ids[0]
    // update
    comments = 'this is a test 2'
    r = await request.put(`/api/comments/${id}`).set(auth0).send({comments})
    expect(r.status).to.equal(201)
    debug('comment updated', r.status)

    // read it check it's updated
    r = await request.get(`/api/comments/${mp3}`).set(auth0)
    expect(r.status).to.equal(200)
    expect(r.body.length).to.be.gt(0)
    expect(r.body.find(comment => comments === comment.data).data).to.equal(comments)
    debug('updated checks out')

    // doesn't exist
    r = await request.get(`/api/comments/${mp3}+'xyzzy123321'`).set(auth0)
    expect(r.status).to.equal(200)
    expect(r.body.length).to.equal(0)

    // delete

    for (var i = 0; i < ids.length; i++) {
      r = await request.del(`/api/comments/${ids[i]}`).set(auth0)
      expect(r.status).to.equal(200)
    }

    // delete doesn't exist
    r = await request.del(`/api/comments/${mp3 + 'testxyzzy123'}'`).set(auth0)

    expect(r.status).to.equal(400)

    // create errors
    r = await request.post(`/api/comments//xxx`).send({comments}).set(auth0)
    expect(r.status).to.equal(404)

    r = await request
      .post(`/api/comments`)

      .send({comments})
      .set(auth0)
    expect(r.status).to.equal(404)
  })

  it('keyvals', async function () {
    let key = 'test000000'
    let val = 'xyzzy111'

    // create
    let r = await request.post(`/api/keyvals/${key}`).set('Content-type', 'text/plain').set(auth0).send(val)
    debug('created', key, val)
    expect(r.status).to.equal(201)

    // read it
    r = await request.get(`/api/keyvals/${key}`).set(auth0)
    expect(r.status).to.equal(200)
    expect(r.body.val).to.equal(val)
    debug('read', key, val)

    // set val to an object
    val = {
      xyzzy: 'plugh!'
    }
    r = await request.post(`/api/keyvals/${key}`).set('Content-type', 'application/json').set(auth0).send(val)
    expect(r.status).to.equal(201)
    debug('set to object', key, val)

    // read it
    r = await request.get(`/api/keyvals/${key}`).set(auth0)
    expect(r.status).to.equal(200)
    expect(r.body.val.xyzzy).to.equal(val.xyzzy)
    debug('read that', key, val)

    // Cant send numbers through chai
    val = 123
    try {
      r = await request.post(`/api/keyvals/${key}`).set('Content-type', 'text/plain').set(auth0).send(val)
      debug('set to number', key, val)
      expect(r.status).to.equal(201)
    } catch (e) {
      expect(e.code).to.equal('ERR_INVALID_ARG_TYPE')
    }

    // read non existent
    r = await request.get(`/api/keyvals/${key + '123123123'}`).set(auth0)
    expect(r.status).to.equal(404)
    debug('read non existent')

    // delete
    r = await request.delete(`/api/keyvals/${key}`).set(auth0)
    expect(r.status).to.equal(200)
    debug('delete keyval created', key)

    // check it's gone
    r = await request.get(`/api/keyvals/${key}`).set(auth0)
    expect(r.status).to.equal(404)
    debug('check its deleted')
  })

  it('users', async function () {
    let user2 = {
      name: 'Joe User',
      email: 'joe@xyzzy.xyz'
    }

    // create user
    let r = await request.post('/api/users').send(user2).set(auth0)
    expect(r.status).to.equal(201)
    expect(r.body.name).to.equal(user2.name)
    expect(r.body.emai).to.equal(user2.emai)
    user2 = Object.assign({}, r.body)
    debug('user2 created id', user2.id)

    // can't create duplicate
    r = await request.post('/api/users').send(user2).set(auth0)
    expect(r.status).to.equal(400)
    debug('user didnt create', JSON.stringify(r.body))

    // read it by id
    r = await request.get(`/api/users/${user2.id}`).set(auth0)
    expect(r.status).to.equal(200)
    expect(r.body.name).to.equal(user2.name)
    expect(r.body.emai).to.equal(user2.emai)

    // read it by email
    r = await request.get(`/api/users/?email=${user2.email}`).set(auth0)
    expect(r.status).to.equal(200)
    expect(r.body.name).to.equal(user2.name)
    expect(r.body.emai).to.equal(user2.emai)

    // update by id
    user2.name = 'Sally User'
    r = await request.put(`/api/users/${user2.id}`).send({name: user2.name}).set(auth0)
    expect(r.status).to.equal(201)

    // read/verify the update by id
    r = await request.get(`/api/users/${user2.id}`).set(auth0)
    expect(r.status).to.equal(200)
    expect(r.body.name).to.equal(user2.name)
    expect(r.body.emai).to.equal(user2.emai)

    // create 2nd user
    let user3 = Object.assign({}, user2)
    user3.email = 'joe1@example.com'
    r = await request.post('/api/users').set(auth0).send(user3)

    expect(r.status).to.equal(201)
    expect(r.body.name).to.equal(user3.name)
    expect(r.body.email).to.equal(user3.email)
    user3 = Object.assign({}, r.body)
    debug('user3 created id', user3.id)

    // get all users
    r = await request.get(`/api/users`).set(auth0)
    expect(r.status).to.equal(200)
    expect(Array.isArray(r.body)).is.true
    expect(r.body.find(u => u.id == user0.id))
    expect(r.body.find(u => u.id == user2.id))
    expect(r.body.find(u => u.id == user3.id))

    // delete user2
    r = await request.delete(`/api/users/${user2.id}`).set(auth0)
    expect(r.status).to.equal(200)
    debug('delete user', user2.id)

    // check it's gone
    r = await request.get(`/api/users/${user2.id}`).set(auth0)
    expect(r.status).to.equal(404)
    debug('check its deleted')

    // delete user3
    r = await request.delete(`/api/users/${user3.id}`).set(auth0)
    expect(r.status).to.equal(200)
    debug('deleted user', user3.id)

    // check it's gone
    r = await request.get(`/api/users/${user3.id}`).set(auth0)
    expect(r.status).to.equal(404)
    debug('check its deleted')
  })

  it('likes', async function () {
    let userid0 = 999
    let userid1 = 998
    let mp30 = utils.generateRandomString(10)
    let mp31 = utils.generateRandomString(10)

    let r

    // like 1st
    r = await request.post(`/api/likes/${mp30}`).set(auth0)
    expect(r.body.affectedRows).to.equal(1)
    r = await request.get(`/api/likes/${mp30}`)
    expect(r.body.likes).to.equal(1)

    // like 2nd
    r = await request.post(`/api/likes/${mp30}`).set(auth1)
    expect(r.body.affectedRows).to.equal(1)
    r = await request.get(`/api/likes/${mp30}`)
    expect(r.body.likes).to.equal(2)

    // delete 1 at a time
    r = await request.del(`/api/likes/${mp30}`).set(auth0)
    expect(r.body.affectedRows).to.equal(1)
    r = await request.get(`/api/likes/${mp30}`)
    expect(r.body.likes).to.equal(1)
    // delete 2nd
    r = await request.del(`/api/likes/${mp30}`).set(auth1)
    expect(r.body.affectedRows).to.equal(1)
    r = await request.get(`/api/likes/${mp30}`)
    expect(r.body.likes).to.equal(0)
  })
})

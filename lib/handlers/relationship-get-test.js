import test from 'ava'
import sinon from 'sinon'

import handler from './relationship'

// Helpers

const createdAt = new Date('2017-05-18T18:43:00Z')
const updatedAt = new Date('2017-05-19T09:11:00Z')

const ent1 = {
  id: 'ent1',
  type: 'entry',
  attributes: { title: 'Entry 1', createdAt, updatedAt },
  relationships: {
    author: { data: { id: 'johnf', type: 'user' } },
    tags: { data: [] }
  }
}

const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huZiIsImlhdCI6MTIzNDV9.XaA_jBXyjwhYgqfK9whtZ1LshcNh1IzD3tPWLtg_meY'
const secret = 's3cr3t'

// Tests

test('should dispatch and return GET action for relationship', async (t) => {
  const dispatch = sinon.stub().resolves({ status: 'ok', data: [ent1] })
  const request = {
    method: 'GET',
    type: 'entry',
    params: { id: 'ent1' },
    relationship: 'author',
    path: '/entries/ent1/relationships/author',
    headers: { authorization: `Bearer ${validJwt}` }
  }
  const expectedAction = {
    type: 'GET',
    payload: {
      id: 'ent1',
      type: 'entry',
      useDefaults: true
    },
    meta: { ident: { id: 'johnf' } }
  }
  const options = { secret }

  await handler({ dispatch, options })(request)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0], expectedAction)
})

test('should return response from GET action for relationship', async (t) => {
  const dispatch = sinon.stub().resolves({ status: 'ok', data: [ent1] })
  const request = {
    method: 'GET',
    type: 'entry',
    params: { id: 'ent1' },
    relationship: 'author',
    path: '/entries/ent1/relationships/author'
  }
  const expectedBody = { data: { type: 'user', id: 'johnf' } }

  const response = await handler({ dispatch })(request)

  t.truthy(response)
  t.is(response.statusCode, 200)
  t.deepEqual(response.body, expectedBody)
})

test('should dispatch GET action with params', async (t) => {
  const dispatch = sinon.stub().resolves({ status: 'ok', data: [ent1] })
  const request = {
    method: 'GET',
    type: 'entry',
    params: { id: 'ent1', max: 10 },
    relationship: 'author',
    path: '/entries/ent1/relationships/author'
  }
  const expectedAction = {
    type: 'GET',
    payload: {
      id: 'ent1',
      type: 'entry',
      useDefaults: true,
      params: { max: 10 }
    },
    meta: { ident: null }
  }

  await handler({ dispatch })(request)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0], expectedAction)
})

test('should return error from GET action', async (t) => {
  const dispatch = sinon.stub().resolves({ status: 'notfound' })
  const request = {
    method: 'GET',
    type: 'entry',
    params: { id: 'ent0' },
    relationship: 'author',
    path: '/entries/ent0/relationships/author'
  }

  const response = await handler({ dispatch })(request)

  t.is(response.statusCode, 404)
})

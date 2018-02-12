import test from 'ava'
import sinon from 'sinon'

import handler from './member'

// Helpers

const createdAt = new Date('2017-05-18T18:43:00Z')
const updatedAt = new Date('2017-05-19T09:11:00Z')

const ent1 = {
  id: 'ent1',
  type: 'entry',
  attributes: {title: 'Entry 1', createdAt, updatedAt},
  relationships: {
    author: {data: {id: 'johnf', type: 'user'}},
    tags: {data: []}
  }
}

const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huZiIsImlhdCI6MTIzNDV9.XaA_jBXyjwhYgqfK9whtZ1LshcNh1IzD3tPWLtg_meY'
const secret = 's3cr3t'

// Tests

test('should dispatch GET action with id', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [ent1]})
  const request = {
    method: 'GET',
    type: 'entry',
    params: {id: 'ent1'},
    path: '/entries/ent1',
    headers: {authorization: `Bearer ${validJwt}`}
  }
  const expected = {
    type: 'GET',
    payload: {
      id: 'ent1',
      type: 'entry',
      useDefaults: true
    },
    meta: {ident: {id: 'johnf'}}
  }
  const options = {secret}

  await handler({dispatch, options})(request)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0], expected)
})

test('should return response from GET action', async (t) => {
  const dispatch = async () => ({status: 'ok', data: [ent1]})
  const request = {
    method: 'GET',
    type: 'entry',
    params: {id: 'ent1'},
    path: '/entries/ent1'
  }
  const expectedBody = {
    data: {
      id: 'ent1',
      type: 'entry',
      attributes: {
        title: 'Entry 1',
        createdAt,
        updatedAt
      },
      relationships: {
        author: {data: {id: 'johnf', type: 'user'}},
        tags: {data: []}
      }
    }
  }

  const ret = await handler({dispatch})(request)

  t.truthy(ret)
  t.is(ret.statusCode, 200)
  t.deepEqual(ret.body, expectedBody)
})

test('should return 404 when not found', async (t) => {
  const dispatch = async () => ({status: 'notfound', error: 'Not found'})
  const request = {
    method: 'GET',
    type: 'entry',
    params: {id: 'ent0'},
    path: '/entries/ent0'
  }

  const ret = await handler({dispatch})(request)

  t.truthy(ret)
  t.is(ret.statusCode, 404)
  t.is(ret.statusMessage, 'Could not find /entries/ent0')
})

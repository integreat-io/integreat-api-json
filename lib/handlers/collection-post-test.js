import test from 'ava'
import sinon from 'sinon'

import handler from './collection'

// Helpers

const createdAt = new Date('2017-05-18T18:43:00Z')
const updatedAt = new Date('2017-05-19T09:11:00Z')

const ent1 = {
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

// Tests

test('should dispatch SET action', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [ent1]})
  const request = {
    method: 'POST',
    type: 'entry',
    path: '/entries',
    body: {data: {
      id: 'ent1',
      type: 'entry',
      attributes: {title: 'Entry 1'},
      relationships: {
        author: {data: {id: 'johnf', type: 'user'}},
        comments: {data: []}
      }
    }}
  }
  const expected = {
    type: 'SET',
    payload: {
      type: 'entry',
      useDefaults: true,
      data: {
        id: 'ent1',
        type: 'entry',
        attributes: {title: 'Entry 1'},
        relationships: {
          author: {data: {id: 'johnf', type: 'user'}},
          comments: {data: []}
        }
      }
    }
  }

  await handler({dispatch})(request)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0], expected)
})

test('should return response from SET action', async (t) => {
  const dispatch = async () => ({status: 'ok', data: [ent1]})
  const request = {
    method: 'POST',
    type: 'entry',
    path: '/entries',
    body: {data: {id: 'ent1', type: 'entry'}} // Simplified
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

  const response = await handler({dispatch})(request)

  t.truthy(response)
  t.is(response.statusCode, 201)
  t.deepEqual(response.body, expectedBody)
})

test('should return error from SET action', async (t) => {
  const dispatch = async () => ({status: 'error', error: 'Big mistake'})
  const request = {
    method: 'POST',
    type: 'entry',
    path: '/entries',
    body: {data: {id: 'ent1', type: 'entry'}} // Simplified
  }

  const response = await handler({dispatch})(request)

  t.truthy(response)
  t.is(response.statusCode, 500)
  t.is(typeof response.statusMessage, 'string')
})

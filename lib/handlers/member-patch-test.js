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

// Tests

test('should dispatch SET action for PATCH request', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [ent1]})
  const request = {
    method: 'PATCH',
    type: 'entry',
    params: {id: 'ent1'},
    path: '/entries/ent1',
    body: {data: {
      id: 'ent1',
      type: 'entry',
      attributes: {title: 'Entry 1'},
      relationships: {
        author: {data: {id: 'johnf', type: 'user'}}
      }
    }}
  }
  const expected = {
    type: 'SET',
    payload: {
      type: 'entry',
      id: 'ent1',
      useDefaults: false,
      data: {
        id: 'ent1',
        type: 'entry',
        attributes: {title: 'Entry 1'},
        relationships: {
          author: {data: {id: 'johnf', type: 'user'}}
        }
      }
    }
  }

  await handler({dispatch})(request)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0], expected)
})

test('should return response from SET action', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [ent1]})
  const request = {
    method: 'PATCH',
    type: 'entry',
    params: {id: 'ent1'},
    path: '/entries/ent1',
    body: {data: {id: 'ent1', type: 'entry'}} // Simplified
  }

  const response = await handler({dispatch})(request)

  t.truthy(response)
  t.is(response.statusCode, 204)
  t.falsy(response.body)
})

test('should return error from SET action', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'error', error: 'The horror'})
  const request = {
    method: 'PATCH',
    type: 'entry',
    params: {id: 'ent1'},
    path: '/entries/ent1',
    body: {data: {id: 'ent1', type: 'entry'}} // Simplified
  }

  const response = await handler({dispatch})(request)

  t.truthy(response)
  t.is(response.statusCode, 500)
  t.is(typeof response.statusMessage, 'string')
})

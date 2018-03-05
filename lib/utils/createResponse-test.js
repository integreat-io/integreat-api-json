import test from 'ava'

import createResponse from './createResponse'

// Helpers

const createdAt = new Date('2017-05-18T18:43:00Z')
const updatedAt = new Date('2017-05-19T09:11:00Z')

const entry1 = {
  id: 'ent1',
  type: 'entry',
  attributes: {
    createdAt,
    updatedAt,
    title: 'Entry 1'
  },
  relationships: {
    author: {data: {id: 'johnf', type: 'user'}}
  }
}

const user1 = {
  id: 'johnf',
  type: 'user',
  attributes: {
    createdAt,
    updatedAt,
    name: 'John F.'
  }
}

// Tests

test('should exist', (t) => {
  t.is(typeof createResponse, 'function')
})

test('should return response', async (t) => {
  const response = {status: 'ok', data: [entry1]}
  const request = {method: 'GET', type: 'entry', path: '/entries'}
  const action = {type: 'GET', payload: {type: 'entry'}}
  const expectedBody = {
    data: [{
      id: 'ent1',
      type: 'entry',
      attributes: {
        title: 'Entry 1',
        createdAt,
        updatedAt
      },
      relationships: {
        author: {data: {id: 'johnf', type: 'user'}}
      }
    }]
  }

  const ret = createResponse(response, request, action)

  t.truthy(ret)
  t.is(ret.statusCode, 200)
  t.deepEqual(ret.body, expectedBody)
})

test('should return response with one item', async (t) => {
  const response = {status: 'ok', data: [entry1]}
  const request = {method: 'GET', type: 'entry', params: {id: 'ent1'}, path: '/entries/ent1'}
  const action = {type: 'GET', payload: {type: 'entry', id: 'ent1'}}
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
        author: {data: {id: 'johnf', type: 'user'}}
      }
    }
  }

  const ret = createResponse(response, request, action)

  t.truthy(ret)
  t.is(ret.statusCode, 200)
  t.deepEqual(ret.body, expectedBody)
})

test('should return response without relationships', async (t) => {
  const response = {status: 'ok', data: [user1]}
  const request = {method: 'GET', type: 'user', params: {id: 'johnf'}, path: '/users/johnf'}
  const action = {type: 'GET', payload: {type: 'user', id: 'johnf'}}
  const expectedBody = {
    data: {
      id: 'johnf',
      type: 'user',
      attributes: {
        name: 'John F.',
        createdAt,
        updatedAt
      }
    }
  }

  const ret = createResponse(response, request, action)

  t.truthy(ret)
  t.is(ret.statusCode, 200)
  t.deepEqual(ret.body, expectedBody)
})

test('should return 404 when not found', async (t) => {
  const response = {status: 'notfound', error: 'Not found'}
  const request = {method: 'GET', type: 'entry', params: {id: 'ent0'}, path: '/entries/ent0'}
  const action = {type: 'GET', payload: {type: 'entry', id: 'ent0'}}

  const ret = createResponse(response, request, action)

  t.truthy(ret)
  t.is(ret.statusCode, 404)
  t.is(ret.statusMessage, 'Could not find /entries/ent0')
})
// All other statuses are tested with ./utils/prepareStatus.js

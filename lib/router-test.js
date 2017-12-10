import test from 'ava'
import sinon from 'sinon'

import router from './router'

// Helpers

const datatypes = {
  'entry': {
    id: 'entry',
    plural: 'entries',
    source: 'entries',
    attributes: {
      title: {type: 'string'}
    },
    relationships: {
      author: {type: 'user'}
    }
  },
  'user': {
    id: 'user',
    plural: 'users',
    source: 'users',
    attributes: {
      name: {type: 'string'}
    }
  }
}

const createdAt = new Date('2017-05-18T18:43:00Z')
const updatedAt = new Date('2017-05-19T09:11:00Z')

const entry1 = {
  id: 'ent1',
  type: 'entry',
  createdAt,
  updatedAt,
  attributes: {
    title: 'Entry 1'
  },
  relationships: {
    author: {id: 'johnf', type: 'user'}
  }
}

// const user1 = {
//   id: 'johnf',
//   type: 'user',
//   createdAt,
//   updatedAt,
//   attributes: {
//     name: 'John F.'
//   }
// }

// Tests

test('should exist', (t) => {
  t.is(typeof router, 'function')
})

test('should dispatch GET action', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [entry1]})
  const request = {
    method: 'GET',
    resource: 'entries'
  }
  const expected = {
    type: 'GET',
    payload: {type: 'entry'}
  }

  await router(dispatch, datatypes)(request)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0], expected)
})

test('should dispatch GET_ONE action', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: entry1})
  const request = {
    method: 'GET',
    resource: 'entries',
    id: 'ent1'
  }
  const expected = {
    type: 'GET_ONE',
    payload: {id: 'ent1', type: 'entry'}
  }

  await router(dispatch, datatypes)(request)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0], expected)
})

test('should return response', async (t) => {
  const dispatch = async () => ({status: 'ok', data: [entry1]})
  const request = {method: 'GET', resource: 'entries'}
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
        author: {id: 'johnf', type: 'user'}
      }
    }]
  }

  const ret = await router(dispatch, datatypes)(request)

  t.truthy(ret)
  t.is(ret.statusCode, 200)
  t.deepEqual(ret.body, expectedBody)
})

test('should return 404 when not found', async (t) => {
  const dispatch = async () => ({status: 'notfound', error: 'Not found'})
  const request = {method: 'GET', resource: 'entries', id: 'ent0'}

  const ret = await router(dispatch, datatypes)(request)

  t.truthy(ret)
  t.is(ret.statusCode, 404)
  t.is(ret.statusMessage, 'Could not find /entries/ent0')
})

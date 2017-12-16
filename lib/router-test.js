import test from 'ava'
import sinon from 'sinon'

import router from './router'

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
    author: {id: 'johnf', type: 'user'}
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

const dispatchMock = async ({payload}) =>
  (payload.id === 'ent1') ? {status: 'ok', data: [entry1]}
  : (payload.id === 'johnf') ? {status: 'ok', data: [user1]}
  : {status: 'notfound'}

// Tests

test('should exist', (t) => {
  t.is(typeof router, 'function')
})

test('should dispatch GET action', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [entry1]})
  const request = {
    method: 'GET',
    type: 'entry',
    path: '/entries'
  }
  const expected = {
    type: 'GET',
    payload: {type: 'entry'}
  }

  await router(dispatch)(request)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0], expected)
})

test('should dispatch GET action with id', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [entry1]})
  const request = {
    method: 'GET',
    type: 'entry',
    id: 'ent1',
    path: '/entries/ent1'
  }
  const expected = {
    type: 'GET',
    payload: {id: 'ent1', type: 'entry'}
  }

  await router(dispatch)(request)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0], expected)
})

test('should dispatch GET action for relationship', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [entry1]})
  const request = {
    method: 'GET',
    type: 'entry',
    id: 'ent1',
    relationship: 'author',
    path: '/entries/ent1/author'
  }
  const expected = {
    type: 'GET',
    payload: {id: 'johnf', type: 'user'}
  }

  await router(dispatch)(request)

  t.is(dispatch.callCount, 2)
  t.deepEqual(dispatch.args[1][0], expected)
})

test('should return response', async (t) => {
  const dispatch = async () => ({status: 'ok', data: [entry1]})
  const request = {
    method: 'GET',
    type: 'entry',
    path: '/entries'
  }
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

  const ret = await router(dispatch)(request)

  t.truthy(ret)
  t.is(ret.statusCode, 200)
  t.deepEqual(ret.body, expectedBody)
})

test('should return response from relationship', async (t) => {
  const dispatch = dispatchMock
  const request = {
    method: 'GET',
    type: 'entry',
    id: 'ent1',
    relationship: 'author',
    path: '/entries/ent1/author'
  }
  const expectedBody = {
    data: [{
      id: 'johnf',
      type: 'user',
      attributes: {
        name: 'John F.',
        createdAt,
        updatedAt
      }
    }]
  }

  const ret = await router(dispatch)(request)

  t.truthy(ret)
  t.is(ret.statusCode, 200)
  t.deepEqual(ret.body, expectedBody)
})

test('should return 404 when not found', async (t) => {
  const dispatch = async () => ({status: 'notfound', error: 'Not found'})
  const request = {
    method: 'GET',
    type: 'entry',
    id: 'ent0',
    path: '/entries/ent0'
  }

  const ret = await router(dispatch)(request)

  t.truthy(ret)
  t.is(ret.statusCode, 404)
  t.is(ret.statusMessage, 'Could not find /entries/ent0')
})

test('should return 404 in relationship request', async (t) => {
  const dispatch = async () => ({status: 'notfound', error: 'Not found'})
  const request = {
    method: 'GET',
    type: 'entry',
    id: 'ent0',
    relationship: 'author',
    path: '/entries/ent0'
  }

  const ret = await router(dispatch)(request)

  t.truthy(ret)
  t.is(ret.statusCode, 404)
  t.is(ret.statusMessage, 'Could not find /entries/ent0')
})

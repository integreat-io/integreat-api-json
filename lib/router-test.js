import test from 'ava'
import sinon from 'sinon'
import integreat from '../../integreat'

import router from './router'

// Helpers

const {datatypes} = integreat({datatypes: require('../tests/helpers/datatypes'), sources: []}, {adapters: {}})

const createdAt = new Date('2017-05-18T18:43:00Z')
const updatedAt = new Date('2017-05-19T09:11:00Z')

const entry1 = {
  id: 'ent1',
  type: 'entry',
  attributes: {title: 'Entry 1', createdAt, updatedAt},
  relationships: {
    author: {id: 'johnf', type: 'user'},
    tags: []
  }
}

const entry2 = {
  id: 'ent2',
  type: 'entry',
  attributes: {title: 'Entry 2', createdAt, updatedAt},
  relationships: {
    author: null,
    tags: [
      {id: 'tag1', type: 'tag'},
      {id: 'tag2', type: 'tag'}
    ]
  }
}

const user1 = {
  id: 'johnf',
  type: 'user',
  attributes: {name: 'John F.', createdAt, updatedAt}
}

const tag1 = {
  id: 'tag1',
  type: 'tag',
  attributes: {name: 'Tag 1', createdAt, updatedAt}
}

const tag2 = {
  id: 'tag2',
  type: 'tag',
  attributes: {name: 'Tag 2', createdAt, updatedAt}
}

const dispatchMock = async (action) => {
  if (!action) {
    return {status: 'noaction'}
  }
  const {id} = action.payload
  return (id === 'ent1') ? {status: 'ok', data: [entry1]}
    : (id === 'ent2') ? {status: 'ok', data: [entry2]}
    : (id === 'johnf') ? {status: 'ok', data: [user1]}
    : (JSON.stringify(id) === JSON.stringify(['tag1', 'tag2']))
      ? {status: 'ok', data: [tag1, tag2]}
    : {status: 'notfound'}
}

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
        author: {id: 'johnf', type: 'user'},
        tags: []
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

  const ret = await router(dispatch)(request)

  t.truthy(ret)
  t.is(ret.statusCode, 200)
  t.deepEqual(ret.body, expectedBody)
})

test('should return response from relationship with several items', async (t) => {
  const dispatch = dispatchMock
  const request = {
    method: 'GET',
    type: 'entry',
    id: 'ent2',
    relationship: 'tags',
    path: '/entries/ent2/tags'
  }
  const expectedBody = {
    data: [
      {
        id: 'tag1',
        type: 'tag',
        attributes: {name: 'Tag 1', createdAt, updatedAt}
      },
      {
        id: 'tag2',
        type: 'tag',
        attributes: {name: 'Tag 2', createdAt, updatedAt}
      }
    ]
  }

  const ret = await router(dispatch)(request)

  t.truthy(ret)
  t.is(ret.statusCode, 200)
  t.deepEqual(ret.body, expectedBody)
})

test('should return response from relationship with no items', async (t) => {
  const dispatch = dispatchMock
  const request = {
    method: 'GET',
    type: 'entry',
    id: 'ent1',
    relationship: 'tags',
    path: '/entries/ent1/tags'
  }
  const expectedBody = {
    data: []
  }

  const ret = await router(dispatch)(request)

  t.truthy(ret)
  t.is(ret.statusCode, 200)
  t.deepEqual(ret.body, expectedBody)
})

test('should return response from relationship with null item', async (t) => {
  const dispatch = dispatchMock
  const request = {
    method: 'GET',
    type: 'entry',
    id: 'ent2',
    relationship: 'author',
    path: '/entries/ent2/author'
  }
  const expectedBody = {
    data: null
  }

  const ret = await router(dispatch)(request)

  t.truthy(ret)
  t.is(ret.statusCode, 200)
  t.deepEqual(ret.body, expectedBody)
})

test('should dispatch action with params for relationship with query def', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [{id: 'ent1', type: 'entry'}]})
  const request = {
    method: 'GET',
    type: 'entry',
    id: 'ent1',
    relationship: 'comments',
    path: '/entries/ent1/comments'
  }
  const expectedAction = {
    type: 'GET',
    payload: {
      type: 'comment',
      params: {
        article: 'ent1'
      }
    }
  }

  await router(dispatch, datatypes)(request)

  t.is(dispatch.callCount, 2)
  t.deepEqual(dispatch.args[1][0], expectedAction)
})

test('should return notfound when no relationship query def', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [{id: 'ent1', type: 'entry'}]})
  const request = {
    method: 'GET',
    type: 'entry',
    id: 'ent1',
    relationship: 'tags',
    path: '/entries/ent1/tags'
  }

  const ret = await router(dispatch, datatypes)(request)

  t.is(ret.statusCode, 404)
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

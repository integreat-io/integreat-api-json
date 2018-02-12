import test from 'ava'
import sinon from 'sinon'

import handler from './referenced'

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

const ent2 = {
  id: 'ent2',
  type: 'entry',
  attributes: {title: 'Entry 2', createdAt, updatedAt},
  relationships: {
    author: null,
    tags: {data: [
      {id: 'tag1', type: 'tag'},
      {id: 'tag2', type: 'tag'}
    ]}
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

const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huZiIsImlhdCI6MTIzNDV9.XaA_jBXyjwhYgqfK9whtZ1LshcNh1IzD3tPWLtg_meY'
const secret = 's3cr3t'

// Tests

test('should dispatch GET action for referenced resource', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [ent1]})
  const request = {
    method: 'GET',
    type: 'entry',
    params: {id: 'ent1'},
    relationship: 'author',
    path: '/entries/ent1/author',
    headers: {authorization: `Bearer ${validJwt}`}
  }
  const expected = {
    type: 'GET',
    payload: {
      id: 'johnf',
      type: 'user',
      useDefaults: true
    },
    meta: {ident: {id: 'johnf'}}
  }
  const options = {secret}

  await handler({dispatch, options})(request)

  t.is(dispatch.callCount, 2)
  t.deepEqual(dispatch.args[1][0], expected)
})

test('should dispatch GET action with array of ids', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [ent2]})
  const request = {
    method: 'GET',
    type: 'entry',
    params: {id: 'ent2'},
    relationship: 'tags',
    path: '/entries/ent2/tags',
    headers: {authorization: `Bearer ${validJwt}`}
  }
  const expected = {
    type: 'GET',
    payload: {
      id: ['tag1', 'tag2'],
      type: 'tag',
      useDefaults: true
    },
    meta: {ident: {id: 'johnf'}}
  }
  const options = {secret}

  await handler({dispatch, options})(request)

  t.is(dispatch.callCount, 2)
  t.deepEqual(dispatch.args[1][0], expected)
})

test('should return response from GET action', async (t) => {
  const dispatch = async ({payload}) =>
    (payload.id === 'ent1') ? {status: 'ok', data: [ent1]}
      : (payload.id === 'johnf') ? {status: 'ok', data: [user1]}
      : {status: 'notfound'}

  const request = {
    method: 'GET',
    type: 'entry',
    params: {id: 'ent1'},
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

  const response = await handler({dispatch})(request)

  t.truthy(response)
  t.is(response.statusCode, 200)
  t.deepEqual(response.body, expectedBody)
})

test('should return response from GET action with several items', async (t) => {
  const dispatch = async ({payload}) =>
    (payload.id === 'ent2') ? {status: 'ok', data: [ent2]}
      : (JSON.stringify(payload.id) === JSON.stringify(['tag1', 'tag2']))
        ? {status: 'ok', data: [tag1, tag2]}
      : {status: 'notfound'}
  const request = {
    method: 'GET',
    type: 'entry',
    params: {id: 'ent2'},
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

  const response = await handler({dispatch})(request)

  t.truthy(response)
  t.is(response.statusCode, 200, response.statusMessage)
  t.deepEqual(response.body, expectedBody)
})

test('should return response from GET action when relationship is empty array', async (t) => {
  const dispatch = async ({payload}) =>
    (payload.id === 'ent1') ? {status: 'ok', data: [ent1]}
      : {status: 'notfound'}
  const request = {
    method: 'GET',
    type: 'entry',
    params: {id: 'ent1'},
    relationship: 'tags',
    path: '/entries/ent1/tags'
  }
  const expectedBody = {
    data: []
  }

  const ret = await handler({dispatch})(request)

  t.truthy(ret)
  t.is(ret.statusCode, 200)
  t.deepEqual(ret.body, expectedBody)
})

test('should return response from GET when relationships is null', async (t) => {
  const dispatch = async ({payload}) =>
    (payload.id === 'ent2') ? {status: 'ok', data: [ent2]}
      : {status: 'notfound'}
  const request = {
    method: 'GET',
    type: 'entry',
    params: {id: 'ent2'},
    relationship: 'author',
    path: '/entries/ent2/author'
  }
  const expectedBody = {
    data: null
  }

  const ret = await handler({dispatch})(request)

  t.truthy(ret)
  t.is(ret.statusCode, 200)
  t.deepEqual(ret.body, expectedBody)
})

test('should return 404 from GET when member is not found', async (t) => {
  const dispatch = async () => ({status: 'notfound', error: 'Not found'})
  const request = {
    method: 'GET',
    type: 'entry',
    params: {id: 'ent0'},
    relationship: 'author',
    path: '/entries/ent0/author'
  }

  const ret = await handler({dispatch})(request)

  t.truthy(ret)
  t.is(ret.statusCode, 404)
  t.is(ret.statusMessage, 'Could not find /entries/ent0/author')
})

import test from 'ava'
import sinon from 'sinon'
import integreat from '../../../integreat'

import handler from './referenced'

// Helpers

const {datatypes} = integreat({datatypes: require('../../tests/helpers/datatypes'), sources: []}, {adapters: {}})

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

const comment1 = {
  id: 'comment1',
  type: 'comment',
  attributes: {text: 'Comment 1'},
  relationships: {}
}

// Tests

test('should dispatch GET action for relationship query', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [ent1]})
  const request = {
    method: 'GET',
    type: 'entry',
    params: {id: 'ent1'},
    relationship: 'comments',
    path: '/entries/ent1/comments'
  }
  const expectedAction = {
    type: 'GET',
    payload: {
      type: 'comment',
      useDefaults: true,
      params: {
        article: 'ent1'
      }
    }
  }

  await handler({dispatch, datatypes})(request)

  t.is(dispatch.callCount, 2)
  t.deepEqual(dispatch.args[1][0], expectedAction)
})

test('should return resource array from GET action with relationship query', async (t) => {
  const dispatch = async ({payload}) =>
    (payload.id === 'ent1') ? {status: 'ok', data: [ent1]}
      : (payload.type === 'comment') ? {status: 'ok', data: [comment1]}
      : {status: 'notfound'}
  const request = {
    method: 'GET',
    type: 'entry',
    params: {id: 'ent1'},
    relationship: 'comments',
    path: '/entries/ent1/comments'
  }
  const expected = {data: [comment1]}

  const response = await handler({dispatch, datatypes})(request)

  t.truthy(response)
  t.is(response.statusCode, 200)
  t.deepEqual(response.body, expected)
})

test('should return empty array from GET action when no query', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [ent1]})
  const request = {
    method: 'GET',
    type: 'entry',
    params: {id: 'ent1'},
    relationship: 'tags',
    path: '/entries/ent1/tags'
  }
  const expected = {data: []}

  const response = await handler({dispatch, datatypes})(request)

  t.truthy(response)
  t.is(response.statusCode, 200)
  t.deepEqual(response.body, expected)
})

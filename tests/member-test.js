import test from 'ava'
import sinon from 'sinon'
import integreat from 'integreat'
import findRoute from './helpers/findRoute'
import {ent1} from './helpers/data'

import jsonapi from '..'

// Helpers

const {datatypes} = integreat({datatypes: require('./helpers/datatypes'), sources: []}, {adapters: {}})

const createdAt = new Date('2018-01-03T12:22:11Z')
const updatedAt = new Date('2018-01-23T17:01:59Z')

// Tests

test('should GET from resource member endpoint', async (t) => {
  const dispatch = sinon.stub()
    .withArgs(sinon.match({type: 'GET', payload: {type: 'entry', id: 'ent1'}}))
    .resolves({status: 'ok', data: [{...ent1, attributes: {...ent1.attributes, createdAt, updatedAt}}]})
  const great = {datatypes, dispatch}
  const request = {method: 'GET', params: {id: 'ent1'}, path: '/entries/ent1'}
  const expected = {data: {
    id: 'ent1',
    type: 'entry',
    attributes: {
      title: 'Entry 1',
      createdAt,
      updatedAt
    },
    relationships: {author: {data: {id: 'johnf', type: 'user'}}}
  }}

  const routes = jsonapi(great)
  const route = findRoute(routes, {path: '/entries/{id}', method: 'GET'})
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 200)
  t.truthy(response.body)
  t.deepEqual(response.body, expected)
})

test('should respond with 404 when GETting unknown resource member', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'notfound', error: 'Not found'})
  const great = {datatypes, dispatch}
  const request = {method: 'GET', params: {id: 'ent0'}, path: '/entries/ent0'}

  const routes = jsonapi(great)
  const route = findRoute(routes, {path: '/entries/{id}', method: 'GET'})
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 404)
  t.is(response.statusMessage, 'Could not find /entries/ent0')
})

test('should PATCH to resource member endpoint', async (t) => {
  const dispatch = sinon.stub()
    .resolves({
      status: 'ok',
      data: [{
        ...ent1,
        attributes: {...ent1.attributes, createdAt, updatedAt},
        relationships: {...ent1.relationships, comments: [{id: 'comment1', type: 'comment'}]}
      }]
    })
  const great = {datatypes, dispatch}
  const request = {
    method: 'PATCH',
    params: {id: 'ent1'},
    body: {
      data: {
        id: 'ent1',
        type: 'entry',
        attributes: {title: 'Entry 1'},
        relationships: {comments: {data: [{id: 'comment1', type: 'comment'}]}}
      }
    },
    path: '/entries/ent1'}
  const expectedAction = {
    type: 'SET',
    payload: {
      type: 'entry',
      id: 'ent1',
      data: {
        id: 'ent1',
        type: 'entry',
        attributes: {title: 'Entry 1'},
        relationships: {comments: [{id: 'comment1', type: 'comment'}]}
      },
      useDefaults: false
    }
  }
  const expectedBody = {data: {
    id: 'ent1',
    type: 'entry',
    attributes: {
      title: 'Entry 1',
      createdAt,
      updatedAt
    },
    relationships: {
      author: {data: {id: 'johnf', type: 'user'}},
      comments: {data: [{id: 'comment1', type: 'comment'}]}
    }
  }}

  const routes = jsonapi(great)
  const route = findRoute(routes, {path: '/entries/{id}', method: 'PATCH'})
  const response = await route.handler(request)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0], expectedAction)
  t.truthy(response)
  t.is(response.statusCode, 200)
  t.truthy(response.body)
  t.deepEqual(response.body, expectedBody)
})

test('should respond with 404 when PATCHting unknown resource member', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'notfound', error: 'Not found'})
  const great = {datatypes, dispatch}
  const request = {
    method: 'PATCH',
    params: {id: 'ent0'},
    path: '/entries/ent0',
    body: {data: {id: 'ent0', type: 'entry', attributes: {title: 'Unknown'}}}
  }

  const routes = jsonapi(great)
  const route = findRoute(routes, {path: '/entries/{id}', method: 'PATCH'})
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 404)
  t.is(response.statusMessage, 'Could not find /entries/ent0')
})

import test from 'ava'
import sinon from 'sinon'
import integreat from 'integreat'
import findRoute from './helpers/findRoute'
import adapters from './helpers/adapters'

import jsonapi from '..'

// Helpers

const createdAt = new Date('2018-01-03T12:22:11Z')
const updatedAt = new Date('2018-01-23T17:01:59Z')

const defs = {
  datatypes: require('./helpers/datatypes'),
  sources: [
    { id: 'entries', adapter: 'mock', endpoints: [{ options: { uri: 'http://example.api.com' } }] }
  ],
  mappings: [
    { type: 'entry', source: 'entries' }
  ]
}

const great = integreat(defs, { adapters })

// Tests

test('should GET from resource member endpoint', async (t) => {
  const request = { method: 'GET', params: { id: 'ent1' }, path: '/entries/ent1' }
  const expected = { data: {
    id: 'ent1',
    type: 'entry',
    attributes: {
      title: 'Entry 1',
      createdAt,
      updatedAt
    },
    relationships: { author: { data: { id: 'johnf', type: 'user' } } }
  } }

  const routes = jsonapi(great)
  const route = findRoute(routes, { path: '/entries/{id}', method: 'GET' })
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 200, response.statusMessage)
  t.deepEqual(response.body, expected)
})

test('should respond with 404 when GETting unknown resource member', async (t) => {
  const request = { method: 'GET', params: { id: 'ent0' }, path: '/entries/ent0' }

  const routes = jsonapi(great)
  const route = findRoute(routes, { path: '/entries/{id}', method: 'GET' })
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 404)
  t.is(response.statusMessage, 'Could not find /entries/ent0')
})

test.serial('should PATCH resource member endpoint', async (t) => {
  const request = {
    method: 'PATCH',
    params: { id: 'ent1' },
    body: {
      data: {
        id: 'ent1',
        type: 'entry',
        attributes: { title: 'Entry 1' },
        relationships: { comments: { data: [{ id: 'comment1', type: 'comment' }] } }
      }
    },
    path: '/entries/ent1' }
  const expectedAction = {
    type: 'SET',
    payload: {
      type: 'entry',
      id: 'ent1',
      data: {
        id: 'ent1',
        type: 'entry',
        attributes: { title: 'Entry 1' },
        relationships: { comments: [{ id: 'comment1', type: 'comment' }] }
      },
      useDefaults: false
    },
    meta: { queue: true, ident: null }
  }
  sinon.spy(great, 'dispatch')

  const routes = jsonapi(great)
  const route = findRoute(routes, { path: '/entries/{id}', method: 'PATCH' })
  const response = await route.handler(request)

  t.is(great.dispatch.callCount, 1)
  t.deepEqual(great.dispatch.args[0][0], expectedAction)
  t.truthy(response)
  t.is(response.statusCode, 204, response.statusMessage)
  t.falsy(response.body)

  great.dispatch.restore()
})

test.serial('should respond with 202 when action is sent to a queue', async (t) => {
  const request = {
    method: 'PATCH',
    params: { id: 'ent1' },
    path: '/entries/ent1',
    body: { data: { id: 'ent1', type: 'entry', attributes: { title: 'Entry 1' } } }
  }
  sinon.stub(great, 'dispatch').resolves({ status: 'queued' })

  const routes = jsonapi(great)
  const route = findRoute(routes, { path: '/entries/{id}', method: 'PATCH' })
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 202)
  t.falsy(response.body)

  great.dispatch.restore()
})

test('should respond with 404 when PATCHing unknown resource member', async (t) => {
  const request = {
    method: 'PATCH',
    params: { id: 'ent0' },
    path: '/entries/ent0',
    body: { data: { id: 'ent0', type: 'entry', attributes: { title: 'Unknown' } } }
  }

  const routes = jsonapi(great)
  const route = findRoute(routes, { path: '/entries/{id}', method: 'PATCH' })
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 404)
  t.is(response.statusMessage, 'Could not find /entries/ent0')
})

test.serial('should DELETE resource member endpoint', async (t) => {
  const request = {
    method: 'DELETE',
    params: { id: 'ent1' },
    body: null,
    path: '/entries/ent1' }
  const expectedAction = {
    type: 'DELETE',
    payload: {
      type: 'entry',
      id: 'ent1',
      useDefaults: false
    },
    meta: { queue: true, ident: null }
  }
  sinon.spy(great, 'dispatch')

  const routes = jsonapi(great)
  const route = findRoute(routes, { path: '/entries/{id}', method: 'DELETE' })
  const response = await route.handler(request)

  t.is(great.dispatch.callCount, 1)
  t.deepEqual(great.dispatch.args[0][0], expectedAction)
  t.truthy(response)
  t.is(response.statusCode, 204)
  t.falsy(response.body)

  great.dispatch.restore()
})

test('should respond with 404 when DELETEing unknown resource member', async (t) => {
  const request = {
    method: 'DELETE',
    params: { id: 'ent0' },
    path: '/entries/ent0'
  }

  const routes = jsonapi(great)
  const route = findRoute(routes, { path: '/entries/{id}', method: 'DELETE' })
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 404)
  t.is(response.statusMessage, 'Could not find /entries/ent0')
})

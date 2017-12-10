import test from 'ava'
import sinon from 'sinon'

import createRoutes from './createRoutes'

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

const getRouteByPath = (routes, path, method) =>
  routes.find((route) => route.path === path && route.method === method)

// Tests

test('should exist', (t) => {
  t.is(typeof createRoutes, 'function')
})

test('should return routes array', (t) => {
  const handler = () => {}

  const ret = createRoutes(datatypes, handler)

  t.true(Array.isArray(ret))
  t.truthy(getRouteByPath(ret, '/entries', 'GET'))
  t.truthy(getRouteByPath(ret, '/entries/{id}', 'GET'))
  t.truthy(getRouteByPath(ret, '/entries/{id}/author', 'GET'))
  t.truthy(getRouteByPath(ret, '/users', 'GET'))
  t.truthy(getRouteByPath(ret, '/users/{id}', 'GET'))
  t.is(ret.length, 5)
})

test('should call router with requests and resource name, and return response', async (t) => {
  const response = {}
  const handler = sinon.stub().resolves(response)
  const request = {method: 'GET', id: 'ent1', query: {}, body: null}
  const expected = {method: 'GET', resource: 'entries', id: 'ent1', query: {}, body: null}

  const routes = createRoutes(datatypes, handler)
  const entryRoute = getRouteByPath(routes, '/entries/{id}', 'GET')
  const ret = await entryRoute.handler(request)

  t.is(handler.callCount, 1)
  t.deepEqual(handler.args[0][0], expected)
  t.is(ret, response)
})

test('should call router with requests, resource name, and relationship name', async (t) => {
  const response = {}
  const handler = sinon.stub().resolves(response)
  const request = {method: 'GET', id: 'ent1', query: {}, body: null}
  const expected = {method: 'GET', resource: 'entries', id: 'ent1', relationship: 'author', query: {}, body: null}

  const routes = createRoutes(datatypes, handler)
  const entryRoute = getRouteByPath(routes, '/entries/{id}/author', 'GET')
  const ret = await entryRoute.handler(request)

  t.is(handler.callCount, 1)
  t.deepEqual(handler.args[0][0], expected)
  t.is(ret, response)
})

import test from 'ava'
import sinon from 'sinon'
import datatypes from '../tests/helpers/datatypes'
import findRoute from '../tests/helpers/findRoute'
import createRoutes from './createRoutes'

// Tests

test('should exist', (t) => {
  t.is(typeof createRoutes, 'function')
})

test('should return routes array with endpoints generated with plurals', (t) => {
  const handler = () => {}

  const ret = createRoutes(datatypes, handler)

  t.true(Array.isArray(ret))
  t.truthy(findRoute(ret, {path: '/entries', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/entries/{id}', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/entries/{id}/author', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/users', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/users/{id}', method: 'GET'}))
  t.is(ret.length, 5)
})

test('should include only routes specified by include option', (t) => {
  const handler = () => {}
  const options = {
    include: ['users']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.true(Array.isArray(ret))
  t.truthy(findRoute(ret, {path: '/users', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/users/{id}', method: 'GET'}))
  t.is(ret.length, 2)
})

test('should include only id-routes specified by include option', (t) => {
  const handler = () => {}
  const options = {
    include: ['users/id']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.true(Array.isArray(ret))
  t.truthy(findRoute(ret, {path: '/users/{id}', method: 'GET'}))
  t.is(ret.length, 1)
})

test('should include only relationship-routes specified by include option', (t) => {
  const handler = () => {}
  const options = {
    include: ['entries/id/author']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.true(Array.isArray(ret))
  t.truthy(findRoute(ret, {path: '/entries/{id}/author', method: 'GET'}))
  t.is(ret.length, 1)
})

test('should call router with requests and resource type, and return response', async (t) => {
  const response = {}
  const handler = sinon.stub().resolves(response)
  const request = {method: 'GET', id: 'ent1', query: {}, body: null}
  const expected = {method: 'GET', type: 'entry', id: 'ent1', query: {}, body: null}

  const routes = createRoutes(datatypes, handler)
  const entryRoute = findRoute(routes, {path: '/entries/{id}', method: 'GET'})
  const ret = await entryRoute.handler(request)

  t.is(handler.callCount, 1)
  t.deepEqual(handler.args[0][0], expected)
  t.is(ret, response)
})

test('should call router with requests, resource name, and relationship name', async (t) => {
  const response = {}
  const handler = sinon.stub().resolves(response)
  const request = {method: 'GET', id: 'ent1', query: {}, body: null}
  const expected = {method: 'GET', type: 'entry', id: 'ent1', relationship: 'author', query: {}, body: null}

  const routes = createRoutes(datatypes, handler)
  const entryRoute = findRoute(routes, {path: '/entries/{id}/author', method: 'GET'})
  const ret = await entryRoute.handler(request)

  t.is(handler.callCount, 1)
  t.deepEqual(handler.args[0][0], expected)
  t.is(ret, response)
})

test('should exclude routes specified by exclude option', (t) => {
  const handler = () => {}
  const options = {
    exclude: ['entries']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.true(Array.isArray(ret))
  t.truthy(findRoute(ret, {path: '/users', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/users/{id}', method: 'GET'}))
  t.is(ret.length, 2)
})

test('should exclude id-routes specified by exclude option', (t) => {
  const handler = () => {}
  const options = {
    exclude: ['entries/id']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.true(Array.isArray(ret))
  t.truthy(findRoute(ret, {path: '/users', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/users/{id}', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/entries', method: 'GET'}))
  t.is(ret.length, 3)
})

test('should exclude relationship-routes specified by exclude option', (t) => {
  const handler = () => {}
  const options = {
    exclude: ['entries/id/author']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.true(Array.isArray(ret))
  t.truthy(findRoute(ret, {path: '/users', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/users/{id}', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/entries', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/entries/{id}', method: 'GET'}))
  t.is(ret.length, 4)
})

test('should let exclude override include option', (t) => {
  const handler = () => {}
  const options = {
    include: ['entries'],
    exclude: ['entries/id/author']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.true(Array.isArray(ret))
  t.truthy(findRoute(ret, {path: '/entries', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/entries/{id}', method: 'GET'}))
  t.is(ret.length, 2)
})

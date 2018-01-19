import test from 'ava'
import sinon from 'sinon'
import integreat from 'integreat'
import findRoute from '../tests/helpers/findRoute'
import createRoutes from './createRoutes'

// Helpers

const {datatypes} = integreat({datatypes: require('../tests/helpers/datatypes'), sources: []}, {adapters: {}})

// Tests

test('should exist', (t) => {
  t.is(typeof createRoutes, 'function')
})

test('should return routes array with endpoints', (t) => {
  const handler = () => {}

  const ret = createRoutes(datatypes, handler)

  t.true(Array.isArray(ret))
  t.truthy(findRoute(ret, {path: '/entries', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/entries', method: 'POST'}))
  t.truthy(findRoute(ret, {path: '/entries/{id}', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/entries/{id}', method: 'PATCH'}))
  t.truthy(findRoute(ret, {path: '/entries/{id}', method: 'DELETE'}))
  t.truthy(findRoute(ret, {path: '/entries/{id}/author', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/entries/{id}/relationships/author', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/users', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/users/{id}', method: 'GET'}))
})

test('should include only routes specified by include option', (t) => {
  const handler = () => {}
  const options = {
    include: ['users']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.truthy(findRoute(ret, {path: '/users', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/users/{id}', method: 'GET'}))
  t.is(ret.length, 2)
})

test('should include only member-routes specified by include option', (t) => {
  const handler = () => {}
  const options = {
    include: ['users/member']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.truthy(findRoute(ret, {path: '/users/{id}', method: 'GET'}))
  t.is(ret.length, 1)
})

test('should include only collection-routes specified by include option', (t) => {
  const handler = () => {}
  const options = {
    include: ['users/collection']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.truthy(findRoute(ret, {path: '/users', method: 'GET'}))
  t.is(ret.length, 1)
})

test('should include only relationship-routes specified by include option', (t) => {
  const handler = () => {}
  const options = {
    include: ['entries/member/author']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.truthy(findRoute(ret, {path: '/entries/{id}/author', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/entries/{id}/relationships/author', method: 'GET'}))
  t.is(ret.length, 2)
})

test('should call router with requests and resource type, and return response', async (t) => {
  const response = {}
  const handler = sinon.stub().resolves(response)
  const request = {method: 'GET', params: {id: 'ent1'}, query: {}, body: null}
  const expected = {method: 'GET', type: 'entry', params: {id: 'ent1'}, query: {}, body: null}

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
  const request = {method: 'GET', params: {id: 'ent1'}, query: {}, body: null}
  const expected = {method: 'GET', type: 'entry', params: {id: 'ent1'}, relationship: 'author', query: {}, body: null}

  const routes = createRoutes(datatypes, handler)
  const entryRoute = findRoute(routes, {path: '/entries/{id}/author', method: 'GET'})
  const ret = await entryRoute.handler(request)

  t.is(handler.callCount, 1)
  t.deepEqual(handler.args[0][0], expected)
  t.is(ret, response)
})

test('should call router with requests, resource name, relationship name, and isRelationship', async (t) => {
  const response = {}
  const handler = sinon.stub().resolves(response)
  const request = {method: 'GET', params: {id: 'ent1'}, query: {}, body: null}
  const expected = {
    method: 'GET',
    type: 'entry',
    params: {id: 'ent1'},
    relationship: 'author',
    isRelationship: true,
    query: {},
    body: null
  }

  const routes = createRoutes(datatypes, handler)
  const entryRoute = findRoute(routes, {path: '/entries/{id}/relationships/author', method: 'GET'})
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

  t.truthy(findRoute(ret, {path: '/users', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/users/{id}', method: 'GET'}))
  t.is(ret.length, 2)
})

test('should exclude member-routes specified by exclude option', (t) => {
  const handler = () => {}
  const options = {
    exclude: ['entries/member']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.truthy(findRoute(ret, {path: '/users', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/users/{id}', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/entries', method: 'GET'}))
  t.is(ret.length, 3)
})

test('should exclude collection-routes specified by exclude option', (t) => {
  const handler = () => {}
  const options = {
    exclude: ['entries/collection']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.falsy(findRoute(ret, {path: '/entries', method: 'GET'}))
})

test('should exclude relationship-routes specified by exclude option', (t) => {
  const handler = () => {}
  const options = {
    exclude: ['entries/member/author']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.true(Array.isArray(ret))
  t.truthy(findRoute(ret, {path: '/users', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/users/{id}', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/entries', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/entries/{id}', method: 'GET'}))
  t.falsy(findRoute(ret, {path: '/entries/{id}/author', method: 'GET'}))
})

test('should let exclude override include option', (t) => {
  const handler = () => {}
  const options = {
    include: ['entries'],
    exclude: ['entries/member/author']
  }

  const ret = createRoutes(datatypes, handler, options)

  t.true(Array.isArray(ret))
  t.truthy(findRoute(ret, {path: '/entries', method: 'GET'}))
  t.truthy(findRoute(ret, {path: '/entries/{id}', method: 'GET'}))
  t.falsy(findRoute(ret, {path: '/entries/{id}/author', method: 'GET'}))
})

test('should not fail when relationships object is missing on datatype', (t) => {
  const datatypes = {entry: {
    id: 'entry',
    plural: 'entries',
    source: 'entries',
    attributes: {
      title: {type: 'string'}
    }
  }}
  const handler = () => {}

  t.notThrows(() => createRoutes(datatypes, handler))
})
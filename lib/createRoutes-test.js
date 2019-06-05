import test from 'ava'
import sinon from 'sinon'
import integreat from 'integreat'
import findRoute from '../tests/helpers/findRoute'
import createRoutes from './createRoutes'

// Helpers

const { datatypes } = integreat({ datatypes: require('../tests/helpers/datatypes'), sources: [] }, { adapters: {} })

// Tests

test('should exist', (t) => {
  t.is(typeof createRoutes, 'function')
})

test('should return routes array with endpoints', (t) => {
  const handlers = {}

  const ret = createRoutes(datatypes, handlers)

  t.true(Array.isArray(ret))
  t.truthy(findRoute(ret, { path: '/entries', method: 'GET' }))
  t.truthy(findRoute(ret, { path: '/entries', method: 'POST' }))
  t.truthy(findRoute(ret, { path: '/entries/{id}', method: 'GET' }))
  t.truthy(findRoute(ret, { path: '/entries/{id}', method: 'PATCH' }))
  t.truthy(findRoute(ret, { path: '/entries/{id}', method: 'DELETE' }))
  t.truthy(findRoute(ret, { path: '/entries/{id}/author', method: 'GET' }))
  t.truthy(findRoute(ret, { path: '/entries/{id}/relationships/author', method: 'GET' }))
  t.truthy(findRoute(ret, { path: '/entries/{id}/relationships/author', method: 'PATCH' }))
  t.truthy(findRoute(ret, { path: '/users', method: 'GET' }))
  t.truthy(findRoute(ret, { path: '/users/{id}', method: 'GET' }))
})

test('should include only routes specified by include option', (t) => {
  const handlers = {}
  const options = {
    include: ['users']
  }

  const ret = createRoutes(datatypes, handlers, options)

  t.truthy(findRoute(ret, { path: '/users', method: 'GET' }))
  t.truthy(findRoute(ret, { path: '/users/{id}', method: 'GET' }))
  t.is(ret.length, 2)
})

test('should include only member-routes specified by include option', (t) => {
  const handlers = {}
  const options = {
    include: ['users/member']
  }

  const ret = createRoutes(datatypes, handlers, options)

  t.truthy(findRoute(ret, { path: '/users/{id}', method: 'GET' }))
  t.is(ret.length, 1)
})

test('should include only collection-routes specified by include option', (t) => {
  const handlers = {}
  const options = {
    include: ['users/collection']
  }

  const ret = createRoutes(datatypes, handlers, options)

  t.truthy(findRoute(ret, { path: '/users', method: 'GET' }))
  t.is(ret.length, 1)
})

test('should include only relationship-routes specified by include option', (t) => {
  const handlers = {}
  const options = {
    include: ['entries/member/author']
  }

  const ret = createRoutes(datatypes, handlers, options)

  t.truthy(findRoute(ret, { path: '/entries/{id}/author', method: 'GET' }))
  t.truthy(findRoute(ret, { path: '/entries/{id}/relationships/author', method: 'GET' }))
  t.is(ret.length, 2)
})

test('should call handler for collection', async (t) => {
  const response = {}
  const handler = sinon.stub().resolves(response)
  const request = { method: 'GET', params: {}, query: {}, body: null }
  const expected = { method: 'GET', type: 'entry', params: {}, query: {}, body: null }

  const routes = createRoutes(datatypes, { collection: handler })
  const entryRoute = findRoute(routes, { path: '/entries', method: 'GET' })
  const ret = await entryRoute.handler(request)

  t.is(handler.callCount, 1)
  t.deepEqual(handler.args[0][0], expected)
  t.is(ret, response)
})

test('should call handler for member', async (t) => {
  const response = {}
  const handler = sinon.stub().resolves(response)
  const request = { method: 'GET', params: { id: 'ent1' }, query: {}, body: null }
  const expected = { method: 'GET', type: 'entry', params: { id: 'ent1' }, query: {}, body: null }

  const routes = createRoutes(datatypes, { member: handler })
  const entryRoute = findRoute(routes, { path: '/entries/{id}', method: 'GET' })
  const ret = await entryRoute.handler(request)

  t.is(handler.callCount, 1)
  t.deepEqual(handler.args[0][0], expected)
  t.is(ret, response)
})

test('should call handler for referenced resource', async (t) => {
  const response = {}
  const handler = sinon.stub().resolves(response)
  const request = { method: 'GET', params: { id: 'ent1' }, query: {}, body: null }
  const expected = { method: 'GET', type: 'entry', params: { id: 'ent1' }, relationship: 'author', query: {}, body: null }

  const routes = createRoutes(datatypes, { referenced: handler })
  const entryRoute = findRoute(routes, { path: '/entries/{id}/author', method: 'GET' })
  const ret = await entryRoute.handler(request)

  t.is(handler.callCount, 1)
  t.deepEqual(handler.args[0][0], expected)
  t.is(ret, response)
})

test('should call handler for relationship', async (t) => {
  const response = {}
  const handler = sinon.stub().resolves(response)
  const request = { method: 'GET', params: { id: 'ent1' }, query: {}, body: null }
  const expected = {
    method: 'GET',
    type: 'entry',
    params: { id: 'ent1' },
    relationship: 'author',
    query: {},
    body: null
  }

  const routes = createRoutes(datatypes, { relationship: handler })
  const entryRoute = findRoute(routes, { path: '/entries/{id}/relationships/author', method: 'GET' })
  const ret = await entryRoute.handler(request)

  t.is(handler.callCount, 1)
  t.deepEqual(handler.args[0][0], expected)
  t.is(ret, response)
})

test('should exclude routes specified by exclude option', (t) => {
  const handlers = {}
  const options = {
    exclude: ['entries', 'comments', 'pages']
  }

  const ret = createRoutes(datatypes, handlers, options)

  t.truthy(findRoute(ret, { path: '/users', method: 'GET' }))
  t.truthy(findRoute(ret, { path: '/users/{id}', method: 'GET' }))
  t.is(ret.length, 2)
})

test('should exclude member-routes specified by exclude option', (t) => {
  const handlers = {}
  const options = {
    exclude: ['entries/member', 'comments', 'pages']
  }

  const ret = createRoutes(datatypes, handlers, options)

  t.truthy(findRoute(ret, { path: '/users', method: 'GET' }))
  t.truthy(findRoute(ret, { path: '/users/{id}', method: 'GET' }))
  t.truthy(findRoute(ret, { path: '/entries', method: 'GET' }))
  t.is(ret.length, 3)
})

test('should exclude collection-routes specified by exclude option', (t) => {
  const handlers = {}
  const options = {
    exclude: ['entries/collection']
  }

  const ret = createRoutes(datatypes, handlers, options)

  t.falsy(findRoute(ret, { path: '/entries', method: 'GET' }))
})

test('should exclude relationship-routes specified by exclude option', (t) => {
  const handlers = {}
  const options = {
    exclude: ['entries/member/author']
  }

  const ret = createRoutes(datatypes, handlers, options)

  t.true(Array.isArray(ret))
  t.truthy(findRoute(ret, { path: '/users', method: 'GET' }))
  t.truthy(findRoute(ret, { path: '/users/{id}', method: 'GET' }))
  t.truthy(findRoute(ret, { path: '/entries', method: 'GET' }))
  t.truthy(findRoute(ret, { path: '/entries/{id}', method: 'GET' }))
  t.falsy(findRoute(ret, { path: '/entries/{id}/author', method: 'GET' }))
})

test('should let exclude override include option', (t) => {
  const handlers = {}
  const options = {
    include: ['entries'],
    exclude: ['entries/member/author']
  }

  const ret = createRoutes(datatypes, handlers, options)

  t.true(Array.isArray(ret))
  t.truthy(findRoute(ret, { path: '/entries', method: 'GET' }))
  t.truthy(findRoute(ret, { path: '/entries/{id}', method: 'GET' }))
  t.falsy(findRoute(ret, { path: '/entries/{id}/author', method: 'GET' }))
})

test('should not fail when relationships object is missing on datatype', (t) => {
  const datatypes = { entry: {
    id: 'entry',
    plural: 'entries',
    source: 'entries',
    attributes: {
      title: { type: 'string' }
    }
  } }
  const handlers = {}

  t.notThrows(() => createRoutes(datatypes, handlers))
})

test('should include token route', (t) => {
  const datatypes = {}
  const handlers = {}
  const options = {
    tokenEndpoint: '/token'
  }

  const ret = createRoutes(datatypes, handlers, options)

  t.truthy(findRoute(ret, { path: '/token', method: 'POST' }))
  t.is(ret.length, 1)
})

test('should include token route without beginning slash', (t) => {
  const datatypes = {}
  const handlers = {}
  const options = {
    tokenEndpoint: 'auth'
  }

  const ret = createRoutes(datatypes, handlers, options)

  t.truthy(findRoute(ret, { path: '/auth', method: 'POST' }))
})

test('should include ident route', (t) => {
  const datatypes = {}
  const handlers = {}
  const options = {
    identEndpoint: '/ident'
  }

  const ret = createRoutes(datatypes, handlers, options)

  t.truthy(findRoute(ret, { path: '/ident', method: 'GET' }))
  t.is(ret.length, 1)
})

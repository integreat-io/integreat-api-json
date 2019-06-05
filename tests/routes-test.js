import test from 'ava'
import sinon from 'sinon'
import findRoute from './helpers/findRoute'
import integreat from 'integreat'

import jsonapi from '..'

// Helpers

const { datatypes } = integreat({ datatypes: require('./helpers/datatypes'), sources: [] }, { adapters: {} })

// Tests

test('should return route objects from Integreat instance', (t) => {
  const great = { datatypes }

  const routes = jsonapi(great)

  t.true(Array.isArray(routes))
  t.truthy(findRoute(routes, { path: '/entries', method: 'GET' }))
  t.truthy(findRoute(routes, { path: '/users', method: 'GET' }))
})

test('should dispatch action on request', async (t) => {
  const dispatch = sinon.stub().resolves({ status: 'ok', data: [{ id: 'ent1', type: 'entry' }] })
  const great = { datatypes, dispatch }
  const request = { method: 'GET', path: '/entries' }
  const expected = {
    type: 'GET',
    payload: {
      type: 'entry',
      useDefaults: true
    },
    meta: { ident: null }
  }

  const routes = jsonapi(great)
  const response = await routes[0].handler(request)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0], expected)
  t.truthy(response)
  t.is(response.statusCode, 200)
  t.true(Array.isArray(response.body.data))
  t.is(response.body.data[0].id, 'ent1')
})

test('should return only routes specified by include option', (t) => {
  const great = { datatypes }
  const options = {
    include: ['entries']
  }

  const routes = jsonapi(great, options)

  t.truthy(findRoute(routes, { path: '/entries', method: 'GET' }))
  t.falsy(findRoute(routes, { path: '/users', method: 'GET' }))
})

test('should exclude routes specified by exclude option', (t) => {
  const great = { datatypes }
  const options = {
    exclude: ['entries']
  }

  const routes = jsonapi(great, options)

  t.falsy(findRoute(routes, { path: '/entries', method: 'GET' }))
  t.truthy(findRoute(routes, { path: '/users', method: 'GET' }))
})

test('should prefix routes', (t) => {
  const great = { datatypes }
  const options = {
    prefix: '/1.0'
  }

  const routes = jsonapi(great, options)

  t.falsy(findRoute(routes, { path: '/entries', method: 'GET' }))
  t.truthy(findRoute(routes, { path: '/1.0/entries', method: 'GET' }))
  t.truthy(findRoute(routes, { path: '/1.0/entries/{id}', method: 'GET' }))
  t.truthy(findRoute(routes, { path: '/1.0/entries/{id}/author', method: 'GET' }))
})

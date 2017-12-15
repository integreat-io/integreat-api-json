import test from 'ava'
import sinon from 'sinon'

import routesFromIntegreat from './routesFromIntegreat'

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

// Tests

test('should exist', (t) => {
  t.is(typeof routesFromIntegreat, 'function')
})

test('should return route objects from Integreat instance', (t) => {
  const great = {datatypes}

  const routes = routesFromIntegreat(great)

  t.true(Array.isArray(routes))
  const entriesRoute = routes.find((route) => route.path === '/entries' && route.method === 'GET')
  t.truthy(entriesRoute)
})

test('should dispatch action on request', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: [{id: 'ent1', type: 'entries'}]})
  const great = {datatypes, dispatch}
  const request = {method: 'GET', type: 'entry', path: '/entries'}
  const expected = {type: 'GET', payload: {type: 'entry'}}

  const routes = routesFromIntegreat(great)
  const response = await routes[0].handler(request)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0], expected)
  t.truthy(response)
  t.is(response.statusCode, 200)
  t.true(Array.isArray(response.body.data))
  t.is(response.body.data[0].id, 'ent1')
})

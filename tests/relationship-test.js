import test from 'ava'
import integreat from 'integreat'
import findRoute from './helpers/findRoute'
import adapters from './helpers/adapters'

import jsonapi from '..'

// Helpers

const defs = {
  datatypes: require('./helpers/datatypes'),
  sources: [
    {id: 'entries', adapter: 'mock', endpoints: [{options: {uri: 'http://example.api.com'}}]}
  ],
  mappings: [
    {type: 'entry', source: 'entries'}
  ]
}

const great = integreat(defs, {adapters})

// Tests

test('should GET relationship endpoint', async (t) => {
  const request = {method: 'GET', params: {id: 'ent1'}, path: '/entries/ent1/relationships/author'}
  const expected = {data: {type: 'user', id: 'johnf'}}

  const routes = jsonapi(great)
  const route = findRoute(routes, {path: '/entries/{id}/relationships/author', method: 'GET'})
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 200, response.statusMessage)
  t.truthy(response.body)
  t.deepEqual(response.body, expected)
})

test('should responde with 404 when GETting unknown relationship endpoint', async (t) => {
  const request = {method: 'GET', params: {id: 'ent0'}, path: '/entries/ent0/relationships/author'}

  const routes = jsonapi(great)
  const route = findRoute(routes, {path: '/entries/{id}/relationships/author', method: 'GET'})
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 404)
  t.truthy(response.statusMessage, 'Cannot find /entries/ent0/relationships/author')
})

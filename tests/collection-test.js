import test from 'ava'
import sinon from 'sinon'
import integreat from '../../integreat'
import findRoute from './helpers/findRoute'
import adapters from './helpers/adapters'

import jsonapi from '..'

// Helpers

const createdAt = new Date('2018-01-03T12:22:11Z')
const updatedAt = new Date('2018-01-23T17:01:59Z')

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

test('should GET from resource collection endpoint', async (t) => {
  const request = {method: 'GET', path: '/entries'}
  const expected = {data: [{
    id: 'ent1',
    type: 'entry',
    attributes: {
      title: 'Entry 1',
      createdAt,
      updatedAt
    },
    relationships: {author: {data: {id: 'johnf', type: 'user'}}}
  }]}

  const routes = jsonapi(great)
  const route = findRoute(routes, {path: '/entries', method: 'GET'})
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 200, response.statusMessage)
  t.truthy(response.body)
  t.deepEqual(response.body, expected)
})

test('should POST to resource collection endpoint', async (t) => {
  const clock = sinon.useFakeTimers()
  const body = {data: {
    id: 'ent2',
    type: 'entry',
    attributes: {
      title: 'Entry 2'
    },
    relationships: {
      author: {data: {id: 'johnf', type: 'user'}}
    }
  }}
  const request = {method: 'POST', path: '/entries', body}
  const expected = {data: {
    ...body.data,
    id: 'ent2',
    attributes: {
      ...body.data.attributes,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }}

  const routes = jsonapi(great)
  const route = findRoute(routes, {path: '/entries', method: 'POST'})
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 201)
  t.deepEqual(response.body, expected)

  clock.restore()
})

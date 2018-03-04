import test from 'ava'
import integreat from 'integreat'
import findRoute from './helpers/findRoute'
import adapters from './helpers/adapters'

import jsonapi from '..'

// Helpers

const defs = {
  datatypes: require('./helpers/datatypes'),
  sources: [
    {id: 'users', adapter: 'mock', endpoints: [{options: {uri: 'http://example.api.com/users'}}]}
  ],
  mappings: [
    {type: 'user', source: 'users'}
  ],
  ident: {
    type: 'user'
  }
}

const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huZiIsImlhdCI6MTIzNDV9.XaA_jBXyjwhYgqfK9whtZ1LshcNh1IzD3tPWLtg_meY'

const createdAt = new Date('2018-01-03T12:22:11Z')
const updatedAt = new Date('2018-01-23T17:01:59Z')

const great = integreat(defs, {adapters})

// Tests

test('should GET relationship endpoint with ident johnf', async (t) => {
  const options = {
    secret: 's3cr3t'
  }
  const request = {
    method: 'GET',
    params: {id: 'johnf'},
    path: '/users/johnf',
    headers: {
      Authorization: `Bearer ${validJwt}`
    }
  }
  const expected = {data: {
    id: 'johnf',
    type: 'user',
    attributes: {
      name: 'John F.',
      tokens: ['twitter|23456'],
      createdAt,
      updatedAt
    },
    relationships: {}
  }}

  const routes = jsonapi(great, options)
  const route = findRoute(routes, {path: '/users/{id}', method: 'GET'})
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 200, response.statusMessage)
  t.truthy(response.body)
  t.deepEqual(response.body, expected)
})

test('should not GET relationship endpoint without ident', async (t) => {
  const options = {
    secret: 's3cr3t'
  }
  const request = {
    method: 'GET',
    params: {id: 'johnf'},
    path: '/users/johnf'
  }

  const routes = jsonapi(great, options)
  const route = findRoute(routes, {path: '/users/{id}', method: 'GET'})
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 401, response.statusMessage)
  t.falsy(response.body)
})

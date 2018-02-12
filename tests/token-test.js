import test from 'ava'
import sinon from 'sinon'
import integreat from '../../integreat'
import findRoute from './helpers/findRoute'
import adapters from './helpers/adapters'

import jsonapi from '..'

// Helpers

const defs = {
  datatypes: require('./helpers/datatypes'),
  sources: [
    {id: 'users', adapter: 'mock', endpoints: [{options: {uri: 'http://example.api.com/users'}}]},
    {id: 'twitter', adapter: 'mock', endpoints: [{options: {uri: 'https://api.twitter.com/1.0/auth'}}]}
  ],
  mappings: [
    {type: 'user', source: 'users'},
    {type: 'user', source: 'twitter', attributes: {id: {path: 'body.id'}}}
  ],
  ident: {
    type: 'user'
  }
}

const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJqb2huZiIsImlhdCI6MTUxODI5MTM4OCwiZXhwIjoxNTI' +
  'wODgzMzg4LCJpc3MiOiJodHRwczovL2V4YW1wbGUuY29tIiwiYXVkIjoiYXBwMSJ9.' +
  'Vl5mtuLNYuuL7i9umkTgw64ukf85b5_kvj1pBQJwLKI'
const secret = 's3cr3t'
const host = 'https://example.com'

const great = integreat(defs, {adapters})

// Tests

test('should respond with access token', async (t) => {
  const clock = sinon.useFakeTimers(1518291388000)
  const options = {
    secret,
    host,
    authSource: 'twitter',
    tokenEndpoint: 'token'
  }
  const request = {
    method: 'POST',
    params: {},
    path: '/token',
    body: {
      grant_type: 'authorization_code',
      code: '12345',
      client_id: 'app1'
    }
  }
  const expected = {
    access_token: validJwt,
    token_type: 'Bearer',
    expires_in: 2592000,
    id_token: validJwt
  }

  const routes = jsonapi(great, options)
  const route = findRoute(routes, {path: '/token', method: 'POST'})
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 200, response.statusMessage)
  t.deepEqual(response.body, expected)

  clock.restore()
})

test('should not have token endpoint when not specified in options', async (t) => {
  const options = {
    secret,
    host,
    authSource: 'twitter'
  }

  const routes = jsonapi(great, options)
  const route = findRoute(routes, {path: '/token', method: 'POST'})

  t.falsy(route)
})

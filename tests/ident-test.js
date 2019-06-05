import test from 'ava'
import integreat from 'integreat'
import findRoute from './helpers/findRoute'
import adapters from './helpers/adapters'
import { johnf } from './helpers/data'

import jsonapi from '..'

// Helpers

const createdAt = new Date('2018-01-03T12:22:11Z')
const updatedAt = new Date('2018-01-23T17:01:59Z')

const defs = {
  datatypes: require('./helpers/datatypes'),
  sources: [
    { id: 'users', adapter: 'mock', endpoints: [{ options: { uri: 'http://example.api.com/users' } }] }
  ],
  mappings: [
    { type: 'user', source: 'users' }
  ],
  ident: {
    type: 'user'
  }
}

const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJqb2huZiIsImlhdCI6MTUxODI5MTM4OCwiZXhwIjo1NTIwODgzMzg' +
  '4LCJpc3MiOiJodHRwczovL2V4YW1wbGUuY29tIiwiYXVkIjoiYXBwMSJ9.' +
  'q4FCDcZ9zrkSOrO2pq1R16eWcD4WM9Pp4jtmnsHKnS8'
const unknownJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJ1bmtub3duIiwiaWF0IjoxNTE4MjkxMzg4LCJleHAiOjU1MjA4ODM' +
  'zODgsImlzcyI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJhdWQiOiJhcHAxIn0.' +
  '-GzijZwcztlXfj4HkS16_7M74GhcoAPhVcx1I7nrgeQ'
const tokenJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJ0d2l0dGVyfDIzNDU2IiwiaWF0IjoxNTE4MjkxMzg4LCJleHAiOjU1' +
  'MjA4ODMzODgsImlzcyI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJhdWQiOiJhcHAxIn0.' +
  'azdvMauU8vOHVIvuWfoJNfegOvsSTvWvt7YmLmPtpcE'
const secret = 's3cr3t'
const host = 'https://example.com'

const great = integreat(defs, { adapters })

// Tests

test('should respond with item corresponding to ident', async (t) => {
  const options = {
    secret,
    host,
    identEndpoint: 'ident'
  }
  const request = {
    method: 'GET',
    params: {},
    path: '/ident',
    headers: {
      Authorization: `Bearer ${validJwt}`
    }
  }
  const expectedBody = { data: {
    ...johnf,
    attributes: { ...johnf.attributes, createdAt, updatedAt } }
  }

  const routes = jsonapi(great, options)
  const route = findRoute(routes, { path: '/ident', method: 'GET' })
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 200, response.statusMessage)
  t.deepEqual(response.body, expectedBody)
})

test('should treat jwt sub as token when specified', async (t) => {
  const options = {
    secret,
    host,
    identEndpoint: 'ident',
    jwtSub: 'withToken'
  }
  const request = {
    method: 'GET',
    params: {},
    path: '/ident',
    headers: {
      Authorization: `Bearer ${tokenJwt}`
    }
  }
  const expectedBody = { data: {
    ...johnf,
    attributes: { ...johnf.attributes, createdAt, updatedAt } }
  }

  const routes = jsonapi(great, options)
  const route = findRoute(routes, { path: '/ident', method: 'GET' })
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 200, response.statusMessage)
  t.deepEqual(response.body, expectedBody)
})

test('should respond with 401 when no authenticated ident', async (t) => {
  const options = {
    secret,
    host,
    identEndpoint: 'ident'
  }
  const request = {
    method: 'GET',
    params: {},
    path: '/ident',
    headers: {
      Authorization: `Bearer invalid`
    }
  }

  const routes = jsonapi(great, options)
  const route = findRoute(routes, { path: '/ident', method: 'GET' })
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 401, response.statusMessage)
})

test('should respond with 404 when item for ident is not found', async (t) => {
  const options = {
    secret,
    host,
    identEndpoint: 'ident'
  }
  const request = {
    method: 'GET',
    params: {},
    path: '/ident',
    headers: {
      Authorization: `Bearer ${unknownJwt}`
    }
  }

  const routes = jsonapi(great, options)
  const route = findRoute(routes, { path: '/ident', method: 'GET' })
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 404, response.statusMessage)
})

test('should not create endpoint unless specified', async (t) => {
  const options = {
    secret,
    host
  }

  const routes = jsonapi(great, options)
  const route = findRoute(routes, { path: '/ident', method: 'GET' })

  t.falsy(route)
})

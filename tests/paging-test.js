import test from 'ava'
import integreat from 'integreat'
import findRoute from './helpers/findRoute'
import adapters from './helpers/adapters'

import jsonapi from '..'

// Helpers

const createdAt = new Date('2018-01-03T12:22:11Z')
const updatedAt = new Date('2018-01-23T17:01:59Z')

const defs = {
  datatypes: require('./helpers/datatypes'),
  sources: [
    {id: 'pages', adapter: 'mock', endpoints: [{options: {uri: 'http://example.api.com/pages'}}]}
  ],
  mappings: [
    {type: 'page', source: 'pages'}
  ]
}

const great = integreat(defs, {adapters})

const firstPage = 'eyJ0eXBlIjoicGFnZSIsInBhZ2VTaXplIjoyLCJwYWdlQWZ0ZXIiOiJwYWdlMiJ9'
const secondPage = 'eyJ0eXBlIjoicGFnZSIsInBhZ2VTaXplIjoyLCJwYWdlQWZ0ZXIiOiJwYWdlNCJ9'

// Tests

test('should GET first page', async (t) => {
  const request = {
    method: 'GET',
    path: '/pages?page=2',
    params: {page: 2}
  }
  const options = {
    baseUri: 'https://api.somesite.com'
  }
  const expected = {
    data: [
      {
        id: 'page1',
        type: 'page',
        attributes: {title: 'Page 1', createdAt, updatedAt},
        relationships: {}
      },
      {
        id: 'page2',
        type: 'page',
        attributes: {title: 'Page 2', createdAt, updatedAt},
        relationships: {}
      }
    ],
    links: {
      first: null,
      last: null,
      prev: null,
      next: `https://api.somesite.com/pages?page=${firstPage}`
    }
  }

  const routes = jsonapi(great, options)
  const route = findRoute(routes, {path: '/pages', method: 'GET'})
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 200, response.statusMessage)
  t.truthy(response.body)
  t.deepEqual(response.body, expected)
})

test('should GET second page', async (t) => {
  const request = {
    method: 'GET',
    path: `/pages?page=${firstPage}`,
    params: {page: firstPage}
  }
  const expected = {
    data: [
      {
        id: 'page3',
        type: 'page',
        attributes: {title: 'Page 3', createdAt, updatedAt},
        relationships: {}
      },
      {
        id: 'page4',
        type: 'page',
        attributes: {title: 'Page 4', createdAt, updatedAt},
        relationships: {}
      }
    ],
    links: {
      first: null,
      last: null,
      prev: null,
      next: `/pages?page=${secondPage}`
    }
  }

  const routes = jsonapi(great)
  const route = findRoute(routes, {path: '/pages', method: 'GET'})
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 200, response.statusMessage)
  t.truthy(response.body)
  t.deepEqual(response.body, expected)
})
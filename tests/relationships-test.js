import test from 'ava'
import sinon from 'sinon'
import integreat from 'integreat'
import findRoute from './helpers/findRoute'

import jsonapi from '..'

// Helpers

const {datatypes} = integreat({datatypes: require('./helpers/datatypes'), sources: []}, {adapters: {}})

const ent1 = {
  id: 'ent1',
  type: 'entry',
  attributes: {
    title: 'Entry 1'
  },
  relationships: {
    author: {id: 'johnf', type: 'user'}
  }
}

// Tests

test('should have relationship endpoint', async (t) => {
  const dispatch = sinon.stub()
    .withArgs(sinon.match({type: 'GET', payload: {type: 'entry', id: 'ent1'}}))
    .resolves({status: 'ok', data: [ent1]})
  const great = {datatypes, dispatch}
  const request = {method: 'GET', params: {id: 'ent1'}, path: '/entries/ent1/relationships/author'}
  const expected = {type: 'user', id: 'johnf'}

  const routes = jsonapi(great)
  const route = findRoute(routes, {path: '/entries/{id}/relationships/author', method: 'GET'})
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 200)
  t.truthy(response.body)
  t.deepEqual(response.body.data, expected)
})

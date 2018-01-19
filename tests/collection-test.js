import test from 'ava'
import sinon from 'sinon'
import integreat from 'integreat'
import findRoute from './helpers/findRoute'
import {ent1} from './helpers/data'

import jsonapi from '..'

// Helpers

const {datatypes} = integreat({datatypes: require('./helpers/datatypes'), sources: []}, {adapters: {}})

const createdAt = new Date('2018-01-03T12:22:11Z')
const updatedAt = new Date('2018-01-23T17:01:59Z')

// Tests

test('should GET from resource collection endpoint', async (t) => {
  const dispatch = sinon.stub()
    .withArgs(sinon.match({type: 'GET', payload: {type: 'entry', id: sinon.match.typeOf('undefined')}}))
    .resolves({status: 'ok', data: [{...ent1, attributes: {...ent1.attributes, createdAt, updatedAt}}]})
  const great = {datatypes, dispatch}
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
  t.is(response.statusCode, 200)
  t.truthy(response.body)
  t.deepEqual(response.body, expected)
})

test('should POST to resource collection endpoint', async (t) => {
  const createdAt = new Date()
  const updatedAt = new Date()
  const requestData = {
    type: 'entry',
    attributes: {title: 'Entry 2'},
    relationships: {author: {id: 'johnf', type: 'user'}}
  }
  const responseData = [{
    id: 'ent2',
    type: 'entry',
    attributes: {title: 'Entry 2', createdAt, updatedAt},
    relationships: {author: {id: 'johnf', type: 'user'}}
  }]
  const dispatch = sinon.stub().resolves({status: 'error'})
  dispatch.withArgs(sinon.match({type: 'SET', payload: {data: requestData}}))
    .resolves({status: 'ok', data: responseData})
  const great = {datatypes, dispatch}
  const body = {data: {
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
      createdAt,
      updatedAt
    }
  }}

  const routes = jsonapi(great)
  const route = findRoute(routes, {path: '/entries', method: 'POST'})
  const response = await route.handler(request)

  t.truthy(response)
  t.is(response.statusCode, 201)
  t.deepEqual(response.body, expected)
})

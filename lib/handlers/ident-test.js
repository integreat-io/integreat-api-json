import test from 'ava'
import sinon from 'sinon'
import {johnf} from '../../tests/helpers/data'

import handler from './ident'

// Helpers

const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJqb2huZiIsImlhdCI6MTUxODI5MTM4OCwiZXhwIjoxNTI' +
  'wODgzMzg4LCJpc3MiOiJodHRwczovL2V4YW1wbGUuY29tIiwiYXVkIjoiYXBwMSJ9.' +
  'Vl5mtuLNYuuL7i9umkTgw64ukf85b5_kvj1pBQJwLKI'
const secret = 's3cr3t'

// Tests

test('should dispatch GET_IDENT', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: johnf})
  const request = {
    method: 'GET',
    path: '/ident',
    headers: {authorization: `Bearer ${validJwt}`}
  }
  const options = {identType: 'user', secret}
  const expected = {
    type: 'GET_IDENT',
    payload: {},
    meta: {ident: {id: 'johnf'}}
  }

  await handler({dispatch, options})(request)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0], expected)
})

test('should return response from GET_IDENT action', async (t) => {
  const dispatch = async () => ({status: 'ok', data: johnf, access: {ident: {id: 'johnf'}}})
  const request = {
    method: 'GET',
    path: '/ident'
  }
  const options = {identType: 'user'}
  const expected = {
    statusCode: 200,
    body: {data: johnf}
  }

  const response = await handler({dispatch, options})(request)

  t.deepEqual(response, expected)
})

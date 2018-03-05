import test from 'ava'
import sinon from 'sinon'

import handler from './token'

// Helpers

const identData = {
  id: 'johnf',
  roles: ['editor'],
  tokens: ['twitter|23456']
}

const authSourceData = {
  id: 'twitter|23456'
}

const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJqb2huZiIsImlhdCI6MTUxODI5MTM4OCwiZXhwIjoxNTI' +
  'wODgzMzg4LCJpc3MiOiJodHRwczovL2V4YW1wbGUuY29tIiwiYXVkIjoiYXBwMSJ9.' +
  'Vl5mtuLNYuuL7i9umkTgw64ukf85b5_kvj1pBQJwLKI'
const secret = 's3cr3t'
const host = 'https://example.com'

// Tests

test('should dispatch GET and GET_IDENT action', async (t) => {
  const dispatch = sinon.stub()
    .onCall(0).resolves({status: 'ok', data: [authSourceData]})
    .onCall(1).resolves({status: 'ok', data: identData})
  const request = {
    method: 'POST',
    path: '/token',
    body: {
      grant_type: 'authorization_code',
      code: '12345',
      client_id: 'app1'
    }
  }
  const expected1 = {
    type: 'GET',
    payload: {
      source: 'authsource',
      type: 'user',
      params: {authCode: '12345'}
    },
    meta: {ident: {root: true}}
  }
  const expected2 = {
    type: 'GET_IDENT',
    payload: {},
    meta: {ident: {withToken: 'twitter|23456'}}
  }
  const options = {secret, host, authSource: 'authsource', identType: 'user'}

  await handler({dispatch, options})(request)

  t.is(dispatch.callCount, 2)
  t.deepEqual(dispatch.args[0][0], expected1)
  t.deepEqual(dispatch.args[1][0], expected2)
})

test('should return response from GET_IDENT action', async (t) => {
  const clock = sinon.useFakeTimers(1518291388000)
  const dispatch = async ({type}) =>
    ({status: 'ok', data: (type === 'GET') ? [authSourceData] : identData})
  const request = {
    method: 'POST',
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
  const options = {secret, host, identType: 'user'}

  const ret = await handler({dispatch, options})(request)

  t.truthy(ret)
  t.is(ret.statusCode, 200, ret.statusMessage)
  t.deepEqual(ret.body, expected)

  clock.restore()
})

test('should return 400 invalid_grant when no token from auth source', async (t) => {
  const dispatch = async ({type}) => ({status: 'notfound', error: 'Not found'})
  const request = {
    method: 'POST',
    path: '/token',
    body: {
      grant_type: 'authorization_code',
      code: '12346',
      client_id: 'app1'
    }
  }
  const options = {secret, identType: 'user'}

  const ret = await handler({dispatch, options})(request)

  t.truthy(ret)
  t.is(ret.statusCode, 400, ret.statusMessage)
  t.is(typeof ret.statusMessage, 'string')
  t.deepEqual(ret.body, {error: 'invalid_grant'})
})

test('should return 400 invalid_grant when no user was found', async (t) => {
  const dispatch = async ({type}) => (type === 'GET')
    ? {status: 'ok', data: [authSourceData]}
    : {status: 'notfound', error: 'Not found'}
  const request = {
    method: 'POST',
    path: '/token',
    body: {
      grant_type: 'authorization_code',
      code: '12345',
      client_id: 'app1'
    }
  }
  const options = {secret, identType: 'user'}

  const ret = await handler({dispatch, options})(request)

  t.truthy(ret)
  t.is(ret.statusCode, 400, ret.statusMessage)
  t.is(typeof ret.statusMessage, 'string')
  t.deepEqual(ret.body, {error: 'invalid_grant'})
})

test('should return 400 invalid_grant when no identType', async (t) => {
  const dispatch = async ({type}) => ({status: 'ok', data: {}})
  const request = {
    method: 'POST',
    path: '/token',
    body: {
      grant_type: 'authorization_code',
      code: '12345',
      client_id: 'app1'
    }
  }
  const options = {secret, host}

  const ret = await handler({dispatch, options})(request)

  t.truthy(ret)
  t.is(ret.statusCode, 400, ret.statusMessage)
  t.is(typeof ret.statusMessage, 'string')
  t.deepEqual(ret.body, {error: 'invalid_grant'})
})

test('should return 400 invalid_request when no code', async (t) => {
  const dispatch = async () => ({status: 'ok', data: {}})
  const request = {
    method: 'POST',
    path: '/token',
    body: {
      grant_type: 'authorization_code',
      client_id: 'app1'
    }
  }
  const options = {secret, identType: 'user'}

  const ret = await handler({dispatch, options})(request)

  t.truthy(ret)
  t.is(ret.statusCode, 400, ret.statusMessage)
  t.is(typeof ret.statusMessage, 'string')
  t.deepEqual(ret.body, {error: 'invalid_request'})
})

test('should return 400 unsupported_grant_type when other grant_type', async (t) => {
  const dispatch = async () => ({status: 'ok', data: {}})
  const request = {
    method: 'POST',
    path: '/token',
    body: {
      grant_type: 'other',
      code: '12345',
      client_id: 'app1'
    }
  }
  const options = {secret, identType: 'user'}

  const ret = await handler({dispatch, options})(request)

  t.truthy(ret)
  t.is(ret.statusCode, 400, ret.statusMessage)
  t.is(typeof ret.statusMessage, 'string')
  t.deepEqual(ret.body, {error: 'unsupported_grant_type'})
})

test('should return 400 invalid_client when no client_id', async (t) => {
  const dispatch = async () => ({status: 'ok', data: {}})
  const request = {
    method: 'POST',
    path: '/token',
    body: {
      grant_type: 'authorization_code',
      code: '12345'
    }
  }
  const options = {secret, identType: 'user'}

  const ret = await handler({dispatch, options})(request)

  t.truthy(ret)
  t.is(ret.statusCode, 400, ret.statusMessage)
  t.is(typeof ret.statusMessage, 'string')
  t.deepEqual(ret.body, {error: 'invalid_client'})
})

test('should return 500 when no secret', async (t) => {
  const dispatch = async ({type}) =>
    ({status: 'ok', data: (type === 'GET') ? [authSourceData] : identData})
  const request = {
    method: 'POST',
    path: '/token',
    body: {
      grant_type: 'authorization_code',
      code: '12345',
      client_id: 'app1'
    }
  }
  const options = {identType: 'user'}

  const ret = await handler({dispatch, options})(request)

  t.truthy(ret)
  t.is(ret.statusCode, 500, ret.statusMessage)
  t.is(typeof ret.statusMessage, 'string')
})

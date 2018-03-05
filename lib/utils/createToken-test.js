import test from 'ava'

import createToken from './createToken'

// Helpers

const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiJqb2huZiIsImlhdCI6MTUxODI5MTM4OCwiZXhwIjoxNTI' +
  'wODgzMzg4LCJpc3MiOiJodHRwczovL2V4YW1wbGUuY29tIiwiYXVkIjoiYXBwMSJ9.' +
  'Vl5mtuLNYuuL7i9umkTgw64ukf85b5_kvj1pBQJwLKI'

// Tests

test('should create token', (t) => {
  const payload = {
    sub: 'johnf',
    iat: 1518291388,
    exp: 1520883388,
    iss: 'https://example.com',
    aud: 'app1'
  }
  const options = {
    secret: 's3cr3t'
  }

  const ret = createToken(payload, options)

  t.deepEqual(ret, validJwt)
})

test('should return null when no secret', (t) => {
  const payload = {
    sub: 'johnf',
    iat: 1518291388,
    exp: 1520883388,
    iss: 'https://example.com',
    aud: 'app1'
  }
  const options = {}

  const ret = createToken(payload, options)

  t.is(ret, null)
})

test('should return null when no payload', (t) => {
  const payload = null
  const options = {
    secret: 's3cr3t'
  }

  const ret = createToken(payload, options)

  t.is(ret, null)
})

import test from 'ava'

import createIdent from './createIdent'

// Helpers

const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huZiIsImlhdCI6MTIzNDV9.XaA_jBXyjwhYgqfK9whtZ1LshcNh1IzD3tPWLtg_meY'

const nosubJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjEyMzQ1fQ.59ZFYMhUcjbrvA1qExufqXE3FQHsiqjyWpa2aGDlbNw'

const invalidJwt = 'invalid.jwt.token'

const secret = 's3cr3t'

// Tests

test('should exist', (t) => {
  t.is(typeof createIdent, 'function')
})

test('should create ident from jwt', (t) => {
  const request = { headers: { authorization: `Bearer ${validJwt}` } }
  const options = { secret }
  const expected = { id: 'johnf' }

  const ret = createIdent(request, options)

  t.deepEqual(ret, expected)
})

test('should create ident from jwt with capitalized header', (t) => {
  const request = { headers: { Authorization: `Bearer ${validJwt}` } }
  const options = { secret }
  const expected = { id: 'johnf' }

  const ret = createIdent(request, options)

  t.deepEqual(ret, expected)
})

test('should return null for invalid token', (t) => {
  const request = { headers: { authorization: `Bearer ${invalidJwt}` } }
  const options = { secret }

  const ret = createIdent(request, options)

  t.is(ret, null)
})

test('should return null when token has no sub', (t) => {
  const request = { headers: { authorization: `Bearer ${nosubJwt}` } }
  const options = { secret }

  const ret = createIdent(request, options)

  t.is(ret, null)
})

test('should return null when no headers', (t) => {
  const request = {}
  const options = { secret }

  const ret = createIdent(request, options)

  t.is(ret, null)
})

test('should return null when not a bearer', (t) => {
  const request = { headers: { authorization: 'invalid' } }
  const options = { secret }

  const ret = createIdent(request, options)

  t.is(ret, null)
})

test('should return null when wrong jwt secret', (t) => {
  const request = { headers: { authorization: `Bearer ${validJwt}` } }
  const options = { secret: 'wrong' }

  const ret = createIdent(request, options)

  t.is(ret, null)
})

import test from 'ava'

import prepareStatus from './prepareStatus'

test('should exist', (t) => {
  t.is(typeof prepareStatus, 'function')
})

test('should return 200 on ok', (t) => {
  const status = 'ok'
  const path = '/entries/ent1'
  const expected = {statusCode: 200}

  const ret = prepareStatus({status}, {path})

  t.deepEqual(ret, expected)
})

test('should return 202 on queued', (t) => {
  const status = 'queued'
  const path = '/entries/ent1'
  const expected = {statusCode: 202, statusMessage: 'The request has been queued'}

  const ret = prepareStatus({status}, {path})

  t.deepEqual(ret, expected)
})

test('should return 200 on noaction', (t) => {
  const status = 'noaction'
  const path = '/entries/ent1'
  const expected = {statusCode: 200}

  const ret = prepareStatus({status}, {path})

  t.deepEqual(ret, expected)
})

test('should return 401 on noaccess', (t) => {
  const status = 'noaccess'
  const path = '/entries/ent1'
  const expected = {statusCode: 401, statusMessage: 'Authorization is needed for /entries/ent1'}

  const ret = prepareStatus({status}, {path})

  t.deepEqual(ret, expected)
})

test('should return 403 on autherror', (t) => {
  const status = 'autherror'
  const path = '/entries/ent1'
  const expected = {statusCode: 403, statusMessage: 'Not authorized for /entries/ent1'}

  const ret = prepareStatus({status}, {path})

  t.deepEqual(ret, expected)
})

test('should return 404 on notfound', (t) => {
  const status = 'notfound'
  const path = '/entries/ent0'
  const expected = {statusCode: 404, statusMessage: 'Could not find /entries/ent0'}

  const ret = prepareStatus({status}, {path})

  t.deepEqual(ret, expected)
})

test('should return 408 on timeout', (t) => {
  const status = 'timeout'
  const path = '/entries/ent1'
  const expected = {statusCode: 408, statusMessage: 'The request timed out'}

  const ret = prepareStatus({status}, {path})

  t.deepEqual(ret, expected)
})

test('should return 500 on error', (t) => {
  const status = 'error'
  const path = '/entries/ent2'
  const expected = {statusCode: 500, statusMessage: 'An error occurred on the server'}

  const ret = prepareStatus({status}, {path})

  t.deepEqual(ret, expected)
})

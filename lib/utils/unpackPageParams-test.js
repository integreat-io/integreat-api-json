import test from 'ava'

import unpackPageParams from './unpackPageParams'

test('should unpack page params', (t) => {
  const params = {
    auth: true,
    page: 'eyJ0eXBlIjoicGFnZSIsInBhZ2VBZnRlciI6InBhZ2UxOSIsInBhZ2VTaXplIjoyMH0%3D'
  }
  const expected = {
    type: 'page',
    pageAfter: 'page19',
    pageSize: 20,
    auth: true
  }

  const ret = unpackPageParams(params)

  t.deepEqual(ret, expected)
})

test('should do nothing when no page param', (t) => {
  const params = {
    auth: true
  }
  const expected = {
    auth: true
  }

  const ret = unpackPageParams(params)

  t.deepEqual(ret, expected)
})

test('should do nothing when no params', (t) => {
  const params = undefined
  const expected = undefined

  const ret = unpackPageParams(params)

  t.deepEqual(ret, expected)
})

test('should remove page when not valid', (t) => {
  const params = {
    auth: true,
    page: 'eyJ0eXBlIjoicGFnZSIsInBhZ2VBZnRlciI6InBhZ2UxOSIsInBhZ2VTaXplIjoyM'
  }
  const expected = {
    auth: true
  }

  const ret = unpackPageParams(params)

  t.deepEqual(ret, expected)
})

test('should change numeric page to a pageSize param', (t) => {
  const params = {
    auth: true,
    page: 20
  }
  const expected = {
    auth: true,
    pageSize: 20
  }

  const ret = unpackPageParams(params)

  t.deepEqual(ret, expected)
})

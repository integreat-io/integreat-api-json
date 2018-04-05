import test from 'ava'

import createPagePath from './createPagePath'

test('should return path for next page', (t) => {
  const paging = {next: {type: 'page', pageAfter: 'page19', pageSize: 20}}
  const request = {path: '/pages'}
  const expected = '/pages?page=eyJ0eXBlIjoicGFnZSIsInBhZ2VBZnRlciI6InBhZ2UxOSIsInBhZ2VTaXplIjoyMH0%3D'

  const ret = createPagePath(paging, request)

  t.is(ret, expected)
})

test('should return path for next page and replace existing page qs', (t) => {
  const paging = {next: {type: 'page', pageAfter: 'page19', pageSize: 20}}
  const request = {path: '/pages?page=20&auth=true'}
  const expected = '/pages?page=eyJ0eXBlIjoicGFnZSIsInBhZ2VBZnRlciI6InBhZ2UxOSIsInBhZ2VTaXplIjoyMH0%3D&auth=true'

  const ret = createPagePath(paging, request)

  t.is(ret, expected)
})

test('should return path with baseUri', (t) => {
  const paging = {next: {type: 'page', pageAfter: 'page19', pageSize: 20}}
  const request = {path: '/pages'}
  const baseUri = 'https://api.somesite.com'
  const expected = 'https://api.somesite.com/pages?page=eyJ0eXBlIjoicGFnZSIsInBhZ2VBZnRlciI6InBhZ2UxOSIsInBhZ2VTaXplIjoyMH0%3D'

  const ret = createPagePath(paging, request, baseUri)

  t.is(ret, expected)
})

test('should handle trailing slash in baseUri', (t) => {
  const paging = {next: {type: 'page', pageAfter: 'page19', pageSize: 20}}
  const request = {path: '/pages'}
  const baseUri = 'https://api.somesite.com/'
  const expected = 'https://api.somesite.com/pages?page=eyJ0eXBlIjoicGFnZSIsInBhZ2VBZnRlciI6InBhZ2UxOSIsInBhZ2VTaXplIjoyMH0%3D'

  const ret = createPagePath(paging, request, baseUri)

  t.is(ret, expected)
})

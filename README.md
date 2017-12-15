# Integreat JSON api

A rest api for Integreat, supporting JSON and specifically
[the JSON API standard](http://jsonapi.org).

## Getting started

### Prerequisits

Requires Integreat v.0.5.0 or higher. Node 8.

### Installing

```
npm install integreat-api-json
```

`integreat-api-json` returns an array of general route objects, that may be
given to a wrapper module for either Express (`integreat-express`) or Hapi
(`integreat-hapi`). For other frameworks, either use the general route objects
or [request a wrapper](https://github.com/integreat-io/integreat-api-json/issues).

Example of use with Hapi:

```javascript
const hapi = require('hapi')
const integreat = require('integreat')
const jsonapi = require('integreat-api-json')
const greatHapi = require('integreat-hapi')

const great = integreat(...)
const routes = greatHapi(jsonapi(great))

const server = new Hapi.Server()
// ... whatever Hapi setup you need
server.route(routes)
server.start()
```

Example of use with Express:

```javascript
const express = require('express')
const integreat = require('integreat')
const jsonapi = require('integreat-api-json')
const greatExpress = require('integreat-express')

const great = integreat(...)
const routes = greatExpress(jsonapi(great))

const app = express()
// ... whatever Express setup you need
app.use(routes)
app.listen(3000)
```

The general route objects looks like this:

```
const routes = [
  {method: 'GET', path: `/entries`, handler: (request) => { ... }},
  {method: 'GET', path: `/entries/{id}`, handler: (request) => { ... }},
  {method: 'GET', path: `/entries/{id}/{relationship}`, handler: (request) => { ... }},
  ...
]
```

Path parameters are specified with surrounding brackets.

The `handlerFunction` accepts a `request` object and returns a `response`
object. Expected `request` object from a GET request to `/entries/ent1/auth`:
```
{
  method: 'GET',
  id: 'ent1',
  relationship: 'author',
  path: '/entries/ent1/auth'
}
```

A `type` property, that indicates the type of resources, is added to the
`request` object by the router, and will in this case be `entry`.

### Running the tests

The tests can be run with `npm test`.

## What routes are created?

`integreat-api-json` will take all datatypes set up on the Integreat instance
(`great` in the examples above), and make several routes for each datatype.

For the following datatype:

```javascript
{
  id: 'entry',
  plural: 'entries',
  attributes: {...},
  relationship: {
    author: {type: 'user'}
  }
}
```

The following routes will be created:
- `GET /entries`
- `GET /entries/{id}`
- `GET /entries/{id}/author`

(POST, PATCH, and DELETE are coming ...)

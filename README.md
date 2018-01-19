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

### Using

`integreat-api-json` returns an array of general route objects, that may be
given to a wrapper module for either Express (`integreat-express`) or Hapi
(`integreat-hapi`). For other frameworks, either use the general route objects
or [request a wrapper](https://github.com/integreat-io/integreat-api-json/issues).

**Note:** `integreat-express` has not been implemented yet. Coming soon ...

Example of use with Hapi:

```javascript
const hapi = require('hapi')
const integreat = require('integreat')
const jsonapi = require('integreat-api-json')
const greatHapi = require('integreat-hapi')

const great = integreat(...)
const options = {...}
const routes = greatHapi(jsonapi(great, options))

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
const options = {...}
const routes = greatExpress(jsonapi(great, options))

const app = express()
// ... whatever Express setup you need
app.use(routes)
app.listen(3000)
```

The general route objects looks like this:

```
const routes = [
  {method: ['GET', 'POST'], path: `/entries`, handler: (request) => { ... }},
  {method: 'GET', path: `/entries/{id}`, handler: (request) => { ... }},
  {method: 'GET', path: `/entries/{id}/author`, handler: (request) => { ... }},
  {method: 'GET', path: `/entries/{id}/relationships/author`, handler: (request) => { ... }},
  ...
]
```

Path parameters are specified with surrounding brackets.

The `handlerFunction` accepts a `request` object and returns a `response`
object. Expected `request` object from a POST request to `/entries/ent1/auth`:

```javascript
{
  method: 'POST',
  params: {id: 'ent1'},
  path: '/entries/ent1/auth',
  body: {...}
}
```

### What routes are created?

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
- `GET /entries/{id}/relationships/author`
- `POST /entries`

(POST, PATCH, and DELETE are coming ...)

### Options

There are two options available, `include` and `exclude`. Use them to specify
which routes to include or exclude. If none of them are set, all possible routes
will be generated from the datatypes. When both of them are set, `exclude` will
have the final word, if there are conflicts.

Example options:
```
{
  include: ['entries', 'users'],
  exclude: ['entries/id/author', 'users/id']
}
```

This example will include all routes for `entries` and `users`, not including
routes from any other datatypes, but will exclude the author endpoint for
`entries` and the member endpoint (`id`) for users.

This means that the following routes will be generated from this example:
- `/entries`
- `/entries/{id}`
- `/users`

## Running the tests

The tests can be run with `npm test`.

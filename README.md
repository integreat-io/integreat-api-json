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
object. Expected `request` object from a POST request to `/entries/ent1/author`:

```javascript
{
  method: 'POST',
  params: {id: 'ent1'},
  path: '/entries/ent1/author',
  body: {...},
  headers: {...}
}
```

### Authentication

`integreat-api-json` does not configure security on its own. This is instead
set up on the Integreat instance, and the json api is simply following its lead.

This will always happen: When a request has an `Authentication` header with
a `Bearer` value, it will be treated as a JWT token, and the `sub` property
of its payload will be treated as the id of an ident and set on the
`meta.ident.id` of the created action. Integreat handles all authorization.

The JWT secret is set as a json api option.

#### Token endpoint

When Integreat is set up with authentication, you may add a token endpoint will
by setting the `tokenEndpoint` to the uri path you want for the endpoint, e.g.
`/token`. This endpoint follows the
[OpenId Connect specification (3.1.3)](http://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint),
but will also accept a request body in JSON.

Put simple, by sending an authentication code to this endpoint, you receive an
auth token that can be used for further requests to the json api as a bearer in
the `Authorization` header.

For this endpoint to work, you need to set up an auth api as an Intgreat source,
and provide the source's name in the `authSource` option to json api. The mapped
id retrieved from this source will be used as a token to retrieve an ident from.

#### Ident endpoint

You may also setup an ident endpoint, that will return the data item
corresponding with an authenticated ident. Set the option `identEndpoint` to the
wanted endpoint path, e.g. `/ident`.

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

- `include` - Specify routes to include
- `exclude` - Specify routes to exclude
- `tokenEndpoint` - Name of token endpoint, which is only added when this is set
- `identEndpoint` - Name of ident endpoint, which is only added when this is set
- `secret` - JWT secret
- `authSource` - Name of Integreat source to get ident token from
- `jwtSub` - Ident prop to set to `sub` value from JWT on auth. Default is `id`

A not on `include` and `exclude`: If none of them are set, all possible routes
will be generated from the datatypes. When both of them are set, `exclude` will
have the final word, if there are conflicts.

Example options:
```
{
  tokenEndpoint: 'auth',
  include: ['entries', 'users'],
  exclude: ['entries/id/author', 'users/id']
}
```

This example will include all routes for `entries` and `users`, not including
routes from any other datatypes, but will exclude the author endpoint for
`entries` and the member endpoint (`id`) for users.

In addition, a token endpoint name `auth` will be created, given that Integreat
is set up with authentication.

This means that the following routes will be generated from this example:
- `/entries`
- `/entries/{id}`
- `/users`
- `/auth`

## Running the tests

The tests can be run with `npm test`.

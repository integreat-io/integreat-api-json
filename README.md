# Integreat JSON api

A rest api for Integreat, supporting JSON and specifically
[the JSON API standard](http://jsonapi.org).

## Getting started

### Prerequisits

Requires Integreat v.0.5.0 or higher.

### Installing

```
npm install integreat-api-json
```

Example of use with Hapi:

```javascript
const hapi = require('hapi')
const integreat = require('integreat')
const jsonapi = require('integreat-api-json')
const greatHapi = require('integreat-hapi')

const great = integreat(...)
const apiOptions = {}
const routes = greatHapi(jsonapi(great, apiOptions))

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
const apiOptions = {}
const routes = greatExpress(jsonapi(great, apiOptions))

const app = express()
// ... whatever Express setup you need
app.use(routes)
app.listen(3000)
```

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

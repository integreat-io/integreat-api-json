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

Example of use:

```javascript
const hapi = require('hapi')
const integreat = require('integreat')
const jsonapi = require('integreat-api-json')

const great = integreat(...)
const apiOptions = {}
const routes = jsonapi(great, apiOptions).hapiRoutes()

const server = new Hapi.Server()
// ... wathever hapi setup you need
server.route(routes)
server.start()
```

When the api is finished, it will support at least Hapi and Express.

### Running the tests

The tests can be run with `npm test`.

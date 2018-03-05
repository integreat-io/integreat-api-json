const createShouldInclude = require('./utils/shouldInclude')

const getTypeAndResource = (datatype) => {
  const {id, plural} = datatype
  return {type: id, resource: plural || `${id}s`}
}

const addLeadingSlash = (endpoint) => (endpoint[0] === '/') ? endpoint : '/' + endpoint

const getResourceRoutes = (datatype, {options, handlers, shouldInclude}) => {
  const {prefix = ''} = options
  const {type, resource} = getTypeAndResource(datatype)
  const routes = []

  if (datatype.internal) {
    return routes
  }

  if (shouldInclude(resource, 'collection')) {
    routes.push({
      method: ['GET', 'POST'],
      path: `${prefix}/${resource}`,
      handler: (request) => handlers.collection({...request, type})
    })
  }
  if (shouldInclude(resource, 'member')) {
    routes.push({
      method: ['GET', 'PATCH', 'DELETE'],
      path: `${prefix}/${resource}/{id}`,
      handler: (request) => handlers.member({...request, type})
    })
  }

  Object.keys(datatype.relationships || {})
    .filter((key) => shouldInclude(resource, 'member', key))
    .forEach((relationship) => {
      routes.push({
        method: 'GET',
        path: `${prefix}/${resource}/{id}/${relationship}`,
        handler: (request) => handlers.referenced({...request, type, relationship})
      })
      routes.push({
        method: ['GET', 'PATCH'],
        path: `${prefix}/${resource}/{id}/relationships/${relationship}`,
        handler: (request) => handlers.relationship({...request, type, relationship})
      })
    })

  return routes
}

/**
 * Return an array of routes, created from the given datatypes. Each route will
 * be handled by the given router.
 *
 * @param {Object} datatypes - Object with datatypes
 * @param {function} handlers - Object of handler functions to call for each route
 * @param {Object} options - Route options
 * @returns {Array} An array of routes
 */
function createRoutes (datatypes, handlers, options = {}) {
  const {prefix = '', tokenEndpoint, identEndpoint} = options
  const shouldInclude = createShouldInclude(options)

  const routes = Object.keys(datatypes)
    .reduce((routes, key) =>
      [...routes, ...getResourceRoutes(datatypes[key], {options, handlers, shouldInclude})], [])

  if (identEndpoint) {
    routes.push({
      method: ['GET'],
      path: `${prefix}${addLeadingSlash(identEndpoint)}`,
      handler: handlers.ident
    })
  }

  if (tokenEndpoint) {
    routes.push({
      method: ['POST'],
      path: `${prefix}${addLeadingSlash(tokenEndpoint)}`,
      handler: handlers.token
    })
  }

  return routes
}

module.exports = createRoutes

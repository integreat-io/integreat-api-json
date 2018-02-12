const createShouldInclude = require('./utils/shouldInclude')

const getTypeAndResource = (datatype) => {
  const {id, plural} = datatype
  return {type: id, resource: plural || `${id}s`}
}

const removeLeadingSlash = (endpoint) => (endpoint[0] === '/') ? endpoint.substr(1) : endpoint

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
  const {prefix = '', tokenEndpoint} = options
  const shouldInclude = createShouldInclude(options)

  const getResourceRoutes = (datatype) => {
    const {type, resource} = getTypeAndResource(datatype)
    const routes = []

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

    if (tokenEndpoint) {
      routes.push({
        method: ['POST'],
        path: `${prefix}/${removeLeadingSlash(tokenEndpoint)}`,
        handler: (request) => handlers.token(request)
      })
    }

    return routes
  }

  const routes = Object.keys(datatypes)
    .reduce((routes, key) =>
      [...routes, ...getResourceRoutes(datatypes[key])], [])

  return routes
}

module.exports = createRoutes

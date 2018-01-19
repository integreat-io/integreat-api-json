const createShouldInclude = require('./utils/shouldInclude')

const getTypeAndResource = (datatype) => {
  const {id, plural} = datatype
  return {type: id, resource: plural || `${id}s`}
}

/**
 * Return an array of routes, created from the given datatypes. Each route will
 * be handled by the given router.
 *
 * @param {Object} datatypes - Object with datatypes
 * @param {function} router - The router function to call for each route
 * @param {Object} options - Route options
 * @returns {Array} An array of routes
 */
function createRoutes (datatypes, router, options = {}) {
  const {prefix = ''} = options
  const shouldInclude = createShouldInclude(options)

  const getResourceRoutes = (datatype) => {
    const {type, resource} = getTypeAndResource(datatype)
    const routes = []

    const handler = (request) => router({...request, type})

    if (shouldInclude(resource, 'collection')) {
      routes.push({method: 'GET', path: `${prefix}/${resource}`, handler})
    }
    if (shouldInclude(resource, 'member')) {
      routes.push({method: 'GET', path: `${prefix}/${resource}/{id}`, handler})
    }

    const rels = Object.keys(datatype.relationships || {})
      .filter((key) => shouldInclude(resource, 'member', key))
      .reduce((rels, relationship) => [
        ...rels,
        {
          method: 'GET',
          path: `${prefix}/${resource}/{id}/${relationship}`,
          handler: (request) => router({...request, type, relationship})
        },
        {
          method: 'GET',
          path: `${prefix}/${resource}/{id}/relationships/${relationship}`,
          handler: (request) => router({...request, type, relationship, isRelationship: true})
        }
      ], [])

    return [...routes, ...rels]
  }

  const routes = Object.keys(datatypes)
    .reduce((routes, key) =>
      [...routes, ...getResourceRoutes(datatypes[key])], [])

  return routes
}

module.exports = createRoutes

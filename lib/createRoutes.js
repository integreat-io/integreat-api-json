/**
 * Return an array of routes, created from the given datatypes. Each route will
 * be handled by the given router.
 *
 * @param {Object} datatypes - Object with datatypes
 * @param {function} router - The router function to call for each route
 * @param {Object} options - Object with a `handler` function
 * @returns {Array} An array of routes
 */
function createRoutes (datatypes, router, options) {
  const setResourceRoutes = (routes, datatype) => {
    const resource = datatype.plural

    const rels = Object.keys(datatype.relationships || {})
      .map((relationship) => ({
        method: 'GET',
        path: `/${resource}/{id}/${relationship}`,
        handler: (request) => router({...request, resource, relationship})
      }))

    const handler = (request) => router({...request, resource})
    return [
      ...routes,
      {method: 'GET', path: `/${resource}`, handler},
      {method: 'GET', path: `/${resource}/{id}`, handler},
      ...rels
    ]
  }

  const routes = Object.keys(datatypes)
    .reduce((routes, key) => setResourceRoutes(routes, datatypes[key]), [])

  return routes
}

module.exports = createRoutes

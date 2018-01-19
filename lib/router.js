const createResponse = require('./utils/createResponse')
const createAction = require('./utils/createAction')

const actionFromRelData = (relData, method) => {
  if (Array.isArray(relData)) {
    if (relData.length === 0) {
      return null
    }
    const ids = relData.map((rel) => rel.id)
    return createAction(method, {type: relData[0].type, id: ids})
  } else {
    const {id, type} = relData
    return createAction(method, {type, id})
  }
}

const actionFromRelQuery = (datatype, relationship, data, method) => {
  const rel = datatype && datatype.relationships && datatype.relationships[relationship]
  if (rel && rel.query) {
    const params = datatype.castQueryParams(relationship, data)
    return createAction(method, {type: rel.type, params})
  }

  return null
}

/**
 * Dispatch an action based on the given request, and return the data in the
 * shape of a response object – or an error.
 *
 * The request is an object with the following props:
 * - `method`: GET|POST|PATCH|DELETE
 * - `type`: The resource type
 * - `id`: The resource id, when accessing a single resource
 * - `relationship`: Set when accessing a relationship of a resource
 *
 * As an example, getting the url `/entries/ent1/author` will result in the
 * following request object:
 * ```
 * {
 *   method: 'GET',
 *   type: 'entry',
 *   id: 'ent1',
 *   relationship: 'author',
 *   path: '/entries/ent1/author'
 *  }
 * ```
 *
 * The `type` is indicated by the first part of the url, and are mapped by the
 * router. `id` and `relationship` maps the next two parts and are optional.
 * `id` is required when a `relationship` is present.
 *
 * @param {function} dispatch - The function to dispatch actions with
 * @param {Object} datatypes - Datatype definitions
 * @returns {function} The method to handle requests with
 */
function router (dispatch, datatypes = {}) {
  return async (request) => {
    const {method, type, params = {}, relationship, isRelationship, body} = request
    const {id} = params
    const isRelationshipResource = (id && relationship && !isRelationship)

    // Member request
    let action = createAction((isRelationshipResource) ? 'GET' : method, {type, id, body})
    let result = await dispatch(action)

    if (result.status === 'ok' && isRelationshipResource) {
      // Relationship request
      const data = result.data[0]
      const relData = data.relationships && data.relationships[relationship]
      if (relData === null) {
        // Value of relationship is actually null - return it
        return createResponse({status: 'ok', data: [null]}, request, {payload: {id: null}})
      } else if (relData !== undefined) {
        // Create an action from rel data ids
        action = actionFromRelData(relData, method)
      } else {
        // Create action from rel query
        action = actionFromRelQuery(datatypes[type], relationship, data, method)
        if (!action) {
          // No action means there where no query. Return 'notfound'
          return createResponse({status: 'notfound'}, request, null)
        }
      }

      result = await dispatch(action)
    }

    return createResponse(result, request, action)
  }
}

module.exports = router

const createResponse = require('./utils/createResponse')
const createAction = require('./utils/createAction')

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
 * @returns {function} The method to handle requests with
 */
function router (dispatch) {
  return async (request) => {
    const {method, type, id, relationship} = request

    // Create action for resource
    let action = createAction(method, type, id)

    // If relationship - dispatch resource action and create a new action for
    // the relationship
    if (id && relationship) {
      const result = await dispatch(action)
      if (result.status === 'ok') {
        const {id: relId, type: relType} = result.data[0].relationships[relationship]
        action = createAction(method, relType, relId)
      } else {
        // Resource was not found - create response right away
        return createResponse(result, request)
      }
    }

    // Dispatch action and create response from the result
    const result = await dispatch(action)
    return createResponse(result, request)
  }
}

module.exports = router

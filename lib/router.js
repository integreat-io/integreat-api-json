const createResponse = require('./utils/createResponse')

const prepareRoutes = (datatypes) => Object.keys(datatypes).reduce((resources, key) => {
  const {plural} = datatypes[key]
  return {...resources, [plural]: datatypes[key]}
}, {})

const createAction = (method, type, id) => {
  const payload = (id) ? {id, type} : {type}
  return {type: 'GET', payload}
}

/**
 * Dispatch an action based on the given request, and return the data in the
 * shape of a response object – or an error.
 *
 * @param {function} dispatch - The function to dispatch actions with
 * @param {Object} datatypes - The datatypes to route to
 * @returns {function} The method to handle requests with
 */
function router (dispatch, datatypes) {
  const resources = prepareRoutes(datatypes)

  return async (request) => {
    const {method, resource, id, relationship} = request

    // Create action for resource
    const {id: type} = resources[resource]
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

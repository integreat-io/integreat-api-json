const createResponse = require('./utils/createResponse')

const prepareRoutes = (datatypes) => Object.keys(datatypes).reduce((resources, key) => {
  const {plural} = datatypes[key]
  return {...resources, [plural]: datatypes[key]}
}, {})

const createAction = (method, type, id) => {
  if (id) {
    return {type: 'GET_ONE', payload: {id, type}}
  } else {
    return {type: 'GET', payload: {type}}
  }
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

  return async ({method, path, query, body}) => {
    const [resource, id] = path
    const type = resources[resource].id
    const action = createAction(method, type, id)

    const ret = await dispatch(action)

    return createResponse(ret, {path})
  }
}

module.exports = router

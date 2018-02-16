const createResponse = require('../utils/createResponse')
const createIdent = require('../utils/createIdent')

const getActionType = (method) => {
  switch (method) {
    case 'PATCH':
      return 'SET'
    case 'DELETE':
      return 'DELETE'
    default:
      return 'GET'
  }
}

const createAction = (request, options) => {
  const {type, method, body} = request

  const ident = createIdent(request, options)
  const {id, ...params} = request.params

  const action = {
    type: getActionType(method),
    payload: {
      type: type,
      id,
      useDefaults: (method === 'GET')
    },
    meta: {ident}
  }

  if (params && Object.keys(params).length > 0) {
    action.payload.params = params
  }
  if (body && body.data) {
    action.payload.data = body.data
  }
  return action
}

/**
 * Dispatch an action based on the given member request, and return the data in
 * the shape of a response object – or an error.
 *
 * This handler will respond to the following props:
 * - `method`: GET|PATCH|DELETE
 * - `type`: The resource type
 * - `id`: The resource id, when accessing a single resource
 * - `body`: The data from the request
 * - `path`: The full path of the request (only used for errors)
 */
function memberHandler ({dispatch, options}) {
  return async (request) => {
    const action = createAction(request, options)
    const response = await dispatch(action)
    return createResponse(response, request, action)
  }
}

module.exports = memberHandler

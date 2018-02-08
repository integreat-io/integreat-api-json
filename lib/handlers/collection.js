const createResponse = require('../utils/createResponse')
const createIdent = require('../utils/createIdent')

const createAction = (request, secret) => {
  const {type, method, body} = request

  const ident = createIdent(request, secret)

  const action = {
    type: (method === 'POST') ? 'SET' : 'GET',
    payload: {
      type: type,
      useDefaults: true
    },
    meta: {ident}
  }
  if (body && body.data) {
    action.payload.data = body.data
  }
  return action
}

/**
 * Dispatch an action based on the given collection request, and return the data
 * in the shape of a response object – or an error.
 *
 * This handler will respond to the following props:
 * - `method`: GET|POST
 * - `type`: The resource type
 * - `body`: The data from the request
 * - `path`: The full path of the request (only used for errors)
 */
function collectionHandler ({dispatch, secret}) {
  return async (request) => {
    const action = createAction(request, secret)
    const response = await dispatch(action)
    return createResponse(response, request, action)
  }
}

module.exports = collectionHandler

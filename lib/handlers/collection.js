const createResponse = require('../utils/createResponse')

const createAction = ({type, method, body}) => {
  const action = {
    type: (method === 'POST') ? 'SET' : 'GET',
    payload: {
      type: type,
      useDefaults: true
    }
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
function collectionHandler ({dispatch}) {
  return async (request) => {
    const action = createAction(request)
    const response = await dispatch(action)
    return createResponse(response, request, action)
  }
}

module.exports = collectionHandler

const prepareStatus = require('../utils/prepareStatus')
const createIdent = require('../utils/createIdent')

const createAction = (request, options) => {
  const {type, params} = request

  const ident = createIdent(request, options)

  return {
    type: 'GET',
    payload: {
      type,
      id: params.id,
      useDefaults: true
    },
    meta: {ident}
  }
}

const createResponse = ({status, data, error}, request, action) => {
  const {relationship} = request
  const statusProps = prepareStatus({status, error}, request)
  const body = (status === 'ok') ? data[0].relationships[relationship] : undefined

  return (body === undefined) ? {...statusProps} : {...statusProps, body}
}
/**
 * Dispatch an action based on the given relationship request, and return the
 * data in the shape of a response object – or an error.
 *
 * This handler will respond to the following props:
 * - `method`: GET
 * - `type`: The resource type
 * - `id`: The resource id, when accessing a single resource
 * - `relationship`: Set when accessing a relationship of a resource
 * - `path`: The full path of the request (only used for errors)
 */
function relationshipHandler ({dispatch, options}) {
  return async (request) => {
    const action = createAction(request, options)
    const response = await dispatch(action)
    return createResponse(response, request, action)
  }
}

module.exports = relationshipHandler

const createResponse = require('../utils/createResponse')
const createIdent = require('../utils/createIdent')

const createAction = (request, options) => {
  const ident = createIdent(request, options)

  return {
    type: 'GET_IDENT',
    payload: {},
    meta: {ident}
  }
}

/**
 * Dispatch an action to get the ident (the full data item) from authenticated
 * on the request. Note that the actual authentication happens outside this
 * handler, so all we do here is asking for the ident – if one exists.
 */
function identHandler ({dispatch, options}) {
  return async (request) => {
    const action = createAction(request, options)
    const result = await dispatch(action)

    if (result.status === 'noaction') {
      return createResponse({result, status: 'noaccess'}, request, action)
    }

    return createResponse(result, request, action)
  }
}

module.exports = identHandler

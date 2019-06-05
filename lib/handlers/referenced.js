const createResponse = require('../utils/createResponse')
const createIdent = require('../utils/createIdent')
const unpackPageParams = require('../utils/unpackPageParams')

const createMemberAction = ({ type, params }, ident) => ({
  type: 'GET',
  payload: {
    type,
    id: params.id,
    useDefaults: false
  },
  meta: { ident }
})

const getTypeAndId = ({ relationship }, member) => {
  const { data = {} } = (member.data[0] && member.data[0].relationships[relationship]) || {}
  if (Array.isArray(data)) {
    return {
      id: data.map(item => item.id),
      type: data[0] && data[0].type
    }
  } else {
    return data
  }
}

const prepareParams = (payloadParams, queryParams) => {
  const params = { ...payloadParams, ...queryParams }
  return unpackPageParams(params)
}

const createQueryAction = (datatype, { relationship }, member, ident, params) => {
  const { type: relType } = (datatype && datatype.relationships[relationship]) || {}
  if (relType) {
    const queryParams = datatype.castQueryParams(relationship, member.data[0])
    return {
      type: 'GET',
      payload: {
        type: relType,
        params: prepareParams(params, queryParams),
        useDefaults: true
      },
      meta: { ident }
    }
  }
}

const createReferencedAction = ({ type, id }, ident, params) => {
  const action = {
    type: 'GET',
    payload: {
      type,
      id,
      useDefaults: true
    },
    meta: { ident }
  }

  if (params && Object.keys(params).length > 0) {
    action.payload.params = params
  }

  return action
}

/**
 * Dispatch an action based on the given referenced resource request, and return
 * the data in the shape of a response object – or an error.
 *
 * This handler will respond to the following props:
 * - `method`: GET
 * - `type`: The resource type
 * - `id`: The resource id, when accessing a single resource
 * - `relationship`: Set when accessing a relationship of a resource
 * - `path`: The full path of the request (only used for errors)
 */
function referencedHandler ({ dispatch, datatypes = {}, options }) {
  return async (request) => {
    const ident = createIdent(request, options)

    const memberAction = createMemberAction(request, ident)
    const memberResponse = await dispatch(memberAction)

    if (memberResponse.status !== 'ok') {
      return createResponse(memberResponse, request, memberAction, options)
    }

    const { type, id } = getTypeAndId(request, memberResponse)
    const { id: _, ...params } = request.params

    if (type && id) {
      const action = createReferencedAction({ type, id }, ident, params)
      const response = await dispatch(action)
      return createResponse(response, request, action, options)
    } else {
      const datatype = datatypes[request.type]
      const queryAction = createQueryAction(datatype, request, memberResponse, ident, params)
      if (queryAction) {
        const response = await dispatch(queryAction)
        return createResponse(response, request, queryAction, options)
      }
    }

    const data = (Array.isArray(id)) ? [] : null
    return createResponse({ status: 'ok', data }, request, options)
  }
}

module.exports = referencedHandler

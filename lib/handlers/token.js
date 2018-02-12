const createToken = require('../utils/createToken')

const expiration = 2592000

const createTokenAction = (request, {authSource, identType}) => {
  const {code: authCode} = request.body

  return {
    type: 'GET',
    payload: {
      type: identType,
      source: authSource,
      params: {authCode}
    },
    meta: {ident: {id: '__great'}}
  }
}

const createIdentAction = (request, withToken) => ({
  type: 'GET_IDENT',
  payload: {},
  meta: {ident: {withToken}}
})

const createError = (error, statusMessage) => ({
  statusCode: 400,
  statusMessage,
  body: {
    error
  }
})

const getIdentId = async (request, dispatch, options) => {
  const tokenResponse = await dispatch(createTokenAction(request, options))
  if (!(tokenResponse.data && tokenResponse.data[0] && tokenResponse.data[0].id)) {
    return null
  }
  const token = tokenResponse.data[0].id

  const identResponse = await dispatch(createIdentAction(request, token))
  if (!identResponse.data) {
    return null
  }

  return identResponse.data.id
}

/**
 * Dispatch an action to authenticate an ident or get the ident already
 * authenticated on the calling client.
 */
function tokenHandler ({dispatch, options}) {
  return async (request) => {
    if (!request.body || !request.body.code) {
      return createError('invalid_request', 'Invalid access token request')
    } else if (request.body.grant_type !== 'authorization_code') {
      return createError('unsupported_grant_type', 'Unsported grant type. Only authorization_code is supported')
    } else if (!request.body.client_id) {
      return createError('invalid_client', 'Invalid or missing client id')
    }

    const sub = await getIdentId(request, dispatch, options)

    if (!sub) {
      return createError('invalid_grant', 'No authorized user or authorized user not found')
    }

    const now = Math.floor(Date.now() / 1000)
    const payload = {
      sub,
      iat: now,
      exp: now + expiration,
      iss: options.host,
      aud: request.body.client_id
    }
    const token = createToken(payload, options)

    if (!token) {
      return {statusCode: 500, statusMessage: 'Could not generate token. Probably missing secret'}
    }

    return {
      statusCode: 200,
      body: {
        access_token: token,
        expires_in: expiration,
        token_type: 'Bearer',
        id_token: token
      }
    }
  }
}

module.exports = tokenHandler

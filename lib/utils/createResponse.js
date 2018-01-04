const prepareStatus = require('./prepareStatus')

/**
 * Create a response object from the given result and request
 *
 * @param {Object} result - The result object returned from dispatch
 * @param {Object} request - The initial request object
 * @param {Object} action - The action object that got this result
 * @returns {Object} A response object
 */
function createResponse ({status, data, error}, {path, id, relationship}, action) {
  const {statusCode, statusMessage} = prepareStatus({status}, {uri: path})
  const {payload} = action || {}

  const response = {
    statusCode
  }
  if (statusMessage) {
    response.statusMessage = statusMessage
  }

  if (status === 'ok' || status === 'noaction') {
    response.body = {
      data: (payload && payload.id !== undefined && !Array.isArray(payload.id))
        ? data[0] : data || []
    }
  }

  return response
}

module.exports = createResponse

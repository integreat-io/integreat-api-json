const prepareStatus = require('./prepareStatus')

/**
 * Create a response object from the given result and request
 *
 * @param {Object} result - The result object returned from dispatch
 * @param {Object} request - The initial request object
 * @returns {Object} A response object
 */
function createResponse ({status, data, error}, {path}) {
  const {statusCode, statusMessage} = prepareStatus({status}, {uri: path})
  const response = {
    statusCode
  }
  if (statusMessage) {
    response.statusMessage = statusMessage
  }

  if (status === 'ok') {
    response.body = {
      data
    }
  }

  return response
}

module.exports = createResponse

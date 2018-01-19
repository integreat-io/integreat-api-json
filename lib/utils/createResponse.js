const prepareStatus = require('./prepareStatus')

const prepareData = (data, id, {relationship, isRelationship}) => {
  if (isRelationship) {
    return data[0].relationships[relationship]
  } else {
    return (id !== undefined && !Array.isArray(id)) ? data[0] : data || []
  }
}

/**
 * Create a response object from the given result and request
 *
 * @param {Object} result - The result object returned from dispatch
 * @param {Object} request - The initial request object
 * @param {Object} action - The action object that got this result
 * @returns {Object} A response object
 */
function createResponse ({status, data, error}, request, action) {
  const {path} = request
  const {statusCode, statusMessage} = prepareStatus({status}, {uri: path})
  const {payload = {}} = action || {}

  const response = {
    statusCode
  }
  if (statusMessage) {
    response.statusMessage = statusMessage
  }

  if (status === 'ok' || status === 'noaction') {
    response.body = {
      data: prepareData(data, payload.id, request)
    }
  }

  return response
}

module.exports = createResponse

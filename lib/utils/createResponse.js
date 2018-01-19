const prepareStatus = require('./prepareStatus')
const dataFromAction = require('./dataFromAction')

const isSingleEntry = (id, method) => (id !== undefined && !Array.isArray(id)) || method === 'POST'

const prepareData = (data, id, {relationship, isRelationship, method}) => {
  if (data === undefined) {
    return undefined
  } else if (isRelationship) {
    return data[0].relationships[relationship]
  } else {
    return (isSingleEntry(id, method))
      ? (data && dataFromAction(data[0]))
      : data.map(dataFromAction)
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
  const {statusCode, statusMessage} = prepareStatus({status}, request)
  const {payload = {}} = action || {}

  const response = {
    statusCode
  }
  if (statusMessage) {
    response.statusMessage = statusMessage
  }

  if (status === 'ok' || status === 'noaction') {
    const bodyData = prepareData(data, payload.id, request)
    if (bodyData !== undefined) {
      response.body = {data: bodyData}
    }
  }

  return response
}

module.exports = createResponse

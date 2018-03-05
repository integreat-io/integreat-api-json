const prepareStatus = require('./prepareStatus')

const isSingleEntry = (id, method, actionType) =>
  (id !== undefined && !Array.isArray(id)) || method === 'POST'

const prepareData = (data, id, {relationship, method}, {type: actionType} = {}) =>
  (isSingleEntry(id, method, actionType)) ? (data && data[0]) : data

/**
 * Create a response object from the given result and request
 *
 * @param {Object} result - The result object returned from dispatch
 * @param {Object} request - The initial request object
 * @param {Object} action - The action object that got this result
 * @returns {Object} A response object
 */
function createResponse ({status, data, error}, request, action) {
  const {statusCode, statusMessage} = prepareStatus({status, error}, request)
  const {payload = {}} = action || {}

  const response = {
    statusCode
  }
  if (statusMessage) {
    response.statusMessage = statusMessage
  }

  if (statusCode !== 204 && (status === 'ok' || status === 'noaction')) {
    response.body = {data: prepareData(data, payload.id, request, action)}
  }

  return response
}

module.exports = createResponse

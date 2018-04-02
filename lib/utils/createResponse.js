const prepareStatus = require('./prepareStatus')
const createPagePath = require('./createPagePath')

const isSingleEntry = (id, method, actionType) =>
  (id !== undefined && !Array.isArray(id)) || method === 'POST'

const prepareData = (data, id, {relationship, method}, {type: actionType} = {}) =>
  (isSingleEntry(id, method, actionType)) ? (data && data[0]) : data

const setBody = (response, data, paging, request, action) => {
  const {payload = {}} = action || {}

  response.body = {
    data: prepareData(data, payload.id, request, action)
  }

  if (paging) {
    const next = createPagePath(paging, request)
    response.body.links = {
      first: null,
      last: null,
      prev: null,
      next
    }
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
function createResponse ({status, data, paging, error}, request, action) {
  const {statusCode, statusMessage} = prepareStatus({status, error}, request)

  const response = {
    statusCode
  }
  if (statusMessage) {
    response.statusMessage = statusMessage
  }

  if (statusCode !== 204 && (status === 'ok' || status === 'noaction')) {
    setBody(response, data, paging, request, action)
  }

  return response
}

module.exports = createResponse

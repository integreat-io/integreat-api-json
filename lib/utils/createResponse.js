const prepareStatus = require('./prepareStatus')

const prepareItem = (item) => {
  const {id, type, createdAt, updatedAt, attributes, relationships} = item
  const ret = {
    id,
    type,
    attributes: {...attributes, createdAt, updatedAt}
  }
  if (relationships) {
    ret.relationships = relationships
  }
  return ret
}

const prepareData = (data) => (Array.isArray(data))
  ? data.map(prepareItem) : prepareItem(data)

/**
 * Create a response object from the given result and request
 *
 * @param {Object} result - The result object returned from dispatch
 * @param {Object} request - The initial request object
 * @returns {Object} A response object
 */
function createResponse ({status, data, error}, {resource, id}) {
  const uri = `/${[resource, id].join('/')}`
  const {statusCode, statusMessage} = prepareStatus({status}, {uri})
  const response = {
    statusCode
  }
  if (statusMessage) {
    response.statusMessage = statusMessage
  }

  if (status === 'ok') {
    response.body = {
      data: prepareData(data)
    }
  }

  return response
}

module.exports = createResponse

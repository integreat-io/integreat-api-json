const getOkCode = (method) => {
  switch (method) {
    case 'POST':
      return 201
    case 'DELETE':
    case 'PATCH':
      return 204
    default:
      return 200
  }
}

function prepareStatus ({ status, error }, { path, method }) {
  switch (status) {
    case 'ok':
      return { statusCode: getOkCode(method) }
    case 'noaction':
      return { statusCode: 200 }
    case 'queued':
      return { statusCode: 202, statusMessage: 'The request has been queued' }
    case 'noaccess':
      return { statusCode: 401, statusMessage: `Authorization is needed for ${path}` }
    case 'autherror':
      return { statusCode: 403, statusMessage: `Not authorized for ${path}` }
    case 'notfound':
      return { statusCode: 404, statusMessage: `Could not find ${path}` }
    case 'timeout':
      return { statusCode: 408, statusMessage: 'The request timed out' }
    default:
      return { statusCode: 500, statusMessage: 'An error occurred on the server' + ((error) ? `: ${error}` : '') }
  }
}

module.exports = prepareStatus

function prepareStatus ({status}, {uri}) {
  switch (status) {
    case 'ok':
    case 'noaction':
      return {statusCode: 200, statusMessage: null}
    case 'queued':
      return {statusCode: 202, statusMessage: 'The request has been queued'}
    case 'noaccess':
      return {statusCode: 401, statusMessage: `Authorization is needed for ${uri}`}
    case 'autherror':
      return {statusCode: 403, statusMessage: `Not authorized for ${uri}`}
    case 'notfound':
      return {statusCode: 404, statusMessage: `Could not find ${uri}`}
    case 'timeout':
      return {statusCode: 408, statusMessage: 'The request timed out'}
    default:
      return {statusCode: 500, statusMessage: 'An error occurred on the server'}
  }
}

module.exports = prepareStatus

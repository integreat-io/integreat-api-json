const querystring = require('querystring')

function createPagePath (paging, { path }, baseUri = '') {
  if (!paging.next) {
    return null
  }

  if (baseUri.endsWith('/')) {
    baseUri = baseUri.substr(0, baseUri.length - 1)
  }

  const [url, oldQs] = path.split('?')
  const qs = querystring.parse(oldQs)

  qs.page = Buffer.from(JSON.stringify(paging.next)).toString('base64')
  return `${baseUri}${url}?${querystring.stringify(qs)}`
}

module.exports = createPagePath

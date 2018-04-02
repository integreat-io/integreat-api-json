const querystring = require('querystring')

function createPagePath (paging, {path}) {
  const [url, oldQs] = path.split('?')
  const qs = querystring.parse(oldQs)

  qs.page = Buffer.from(JSON.stringify(paging.next)).toString('base64')
  return `${url}?${querystring.stringify(qs)}`
}

module.exports = createPagePath

const jwt = require('jsonwebtoken')

const parseToken = (headers) => {
  const authHeader = headers.authorization || headers.Authorization
  return (authHeader && authHeader.substr(0, 7) === 'Bearer ')
    ? authHeader.substr(7)
    : null
}

const verifyTokenAndGetSub = (token, secret) => {
  const decoded = jwt.verify(token, secret, {algorithm: 'HS256'})
  return decoded.sub
}

function createIdent ({headers = {}}, {secret, jwtSub = 'id'} = {}) {
  const token = parseToken(headers)
  if (token) {
    try {
      const sub = verifyTokenAndGetSub(token, secret)
      if (sub) {
        return {[jwtSub]: sub}
      }
    } catch (error) {}
  }

  return null
}

module.exports = createIdent

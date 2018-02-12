const jwt = require('jsonwebtoken')

function createIdent ({headers = {}}, {secret, jwtSub = 'id'} = {}) {
  const authHeader = headers.authorization || headers.Authorization

  if (authHeader && authHeader.substr(0, 7) === 'Bearer ') {
    const encoded = authHeader.substr(7)

    try {
      const decoded = jwt.verify(encoded, secret, {algorithm: 'HS256'})
      if (decoded.sub) {
        return {[jwtSub]: decoded.sub}
      }
    } catch (error) {}
  }

  return null
}

module.exports = createIdent

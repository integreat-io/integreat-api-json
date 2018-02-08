const jwt = require('jsonwebtoken')

const options = {algorithm: 'HS256'}

function createIdent ({headers = {}}, secret) {
  const authHeader = headers.authorization || headers.Authorization

  if (authHeader && authHeader.substr(0, 7) === 'Bearer ') {
    const encoded = authHeader.substr(7)

    try {
      const decoded = jwt.verify(encoded, secret, options)
      if (decoded.sub) {
        return {id: decoded.sub}
      }
    } catch (error) {}
  }

  return null
}

module.exports = createIdent

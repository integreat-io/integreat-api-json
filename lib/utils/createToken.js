const jwt = require('jsonwebtoken')

function createToken (payload, { secret }) {
  if (payload && secret) {
    return jwt.sign(payload, secret, { algorithm: 'HS256' })
  }
  return null
}

module.exports = createToken

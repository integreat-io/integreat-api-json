const createRoutes = require('./createRoutes')
const setupDispatch = require('./dispatch')
const collectionHandler = require('./handlers/collection')
const memberHandler = require('./handlers/member')
const referencedHandler = require('./handlers/referenced')
const relationshipHandler = require('./handlers/relationship')
const tokenHandler = require('./handlers/token')

function setupRouter (great, options = {}) {
  const {datatypes, identType} = great
  const dispatch = setupDispatch(great.dispatch)
  const tokenEndpoint = (identType) ? options.tokenEndpoint || 'token' : null
  options = {...options, tokenEndpoint, identType}

  const handlers = {
    collection: collectionHandler({dispatch, datatypes, options}),
    member: memberHandler({dispatch, datatypes, options}),
    referenced: referencedHandler({dispatch, datatypes, options}),
    relationship: relationshipHandler({dispatch, datatypes, options}),
    token: tokenHandler({dispatch, datatypes, options})
  }

  return createRoutes(datatypes, handlers, options)
}

module.exports = setupRouter

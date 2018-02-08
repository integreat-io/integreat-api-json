const createRoutes = require('./createRoutes')
const setupDispatch = require('./dispatch')
const collectionHandler = require('./handlers/collection')
const memberHandler = require('./handlers/member')
const referencedHandler = require('./handlers/referenced')
const relationshipHandler = require('./handlers/relationship')

function setupRouter (great, options = {}) {
  const {secret} = options
  const {datatypes} = great
  const dispatch = setupDispatch(great.dispatch)

  const handlers = {
    collection: collectionHandler({dispatch, datatypes, secret}),
    member: memberHandler({dispatch, datatypes, secret}),
    referenced: referencedHandler({dispatch, datatypes, secret}),
    relationship: relationshipHandler({dispatch, datatypes, secret})
  }

  return createRoutes(datatypes, handlers, options)
}

module.exports = setupRouter

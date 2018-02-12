const createRoutes = require('./createRoutes')
const setupDispatch = require('./dispatch')

const handlerKeys = [
  'collection',
  'member',
  'referenced',
  'relationship',
  'token',
  'ident'
]

function setupRouter (great, options = {}) {
  const {datatypes, identType} = great
  const dispatch = setupDispatch(great.dispatch)
  const tokenEndpoint = (identType) ? options.tokenEndpoint : null
  options = {...options, tokenEndpoint, identType}

  const handlers = handlerKeys.reduce((handlers, key) => ({
    ...handlers,
    [key]: require(`./handlers/${key}`)({dispatch, datatypes, options})
  }), {})

  return createRoutes(datatypes, handlers, options)
}

module.exports = setupRouter

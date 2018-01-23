const createRoutes = require('./createRoutes')
const setupDispatch = require('./dispatch')
const router = require('./router')

function setupRouter (great, options) {
  const {datatypes, dispatch} = great
  return createRoutes(datatypes, router(setupDispatch(dispatch), datatypes), options)
}

module.exports = setupRouter

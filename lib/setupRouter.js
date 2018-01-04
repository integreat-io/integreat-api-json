const createRoutes = require('./createRoutes')
const router = require('./router')

function setupRouter (great, options) {
  const {datatypes, dispatch} = great
  return createRoutes(datatypes, router(dispatch, datatypes), options)
}

module.exports = setupRouter

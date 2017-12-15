const createRoutes = require('./createRoutes')
const router = require('./router')

function routesFromIntegreat (great) {
  const {datatypes, dispatch} = great
  return createRoutes(datatypes, router(dispatch))
}

module.exports = routesFromIntegreat

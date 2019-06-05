function findRoute (routes, { path, method }) {
  return routes.find((route) => route.path === path && [].concat(route.method).includes(method))
}

module.exports = findRoute

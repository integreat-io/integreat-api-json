function findRoute (routes, {path, method}) {
  return routes.find((route) => route.path === path && route.method === method)
}

module.exports = findRoute

function prepareRoutes (datatypes) {
  const addRoute = (resources, key) => {
    const {plural} = datatypes[key]
    return {...resources, [plural]: datatypes[key].id}
  }

  return Object.keys(datatypes)
  .reduce(addRoute, {})
}

module.exports = prepareRoutes

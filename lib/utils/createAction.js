function createAction (method, type, id) {
  const payload = (id) ? {id, type} : {type}
  return {type: 'GET', payload}
}

module.exports = createAction

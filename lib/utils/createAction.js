function createAction (method, payload) {
  const {id, ...rest} = payload
  return {type: 'GET', payload: (id === undefined || id === null) ? rest : payload}
}

module.exports = createAction

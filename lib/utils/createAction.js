function createAction (method, payload) {
  const {id, ...rest} = payload
  return {type: 'GET', payload: (id === undefined) ? rest : payload}
}

module.exports = createAction

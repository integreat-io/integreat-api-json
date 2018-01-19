const dataToAction = require('./dataToAction')

const typeFromMethod = (method) => (method === 'POST') ? 'SET' : 'GET'

function createAction (method, {type, id, params, body}) {
  const action = {type: typeFromMethod(method), payload: {type}}

  if (id) {
    action.payload.id = id
  }
  if (params) {
    action.payload.params = params
  }
  if (body) {
    action.payload.data = dataToAction(body.data)
  }

  return action
}

module.exports = createAction

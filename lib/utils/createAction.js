const dataToAction = require('./dataToAction')

const typeFromMethod = (method) => {
  switch (method) {
    case 'POST':
    case 'PATCH':
      return 'SET'
    case 'DELETE':
      return 'DELETE'
    default:
      return 'GET'
  }
}

function createAction (method, {type, id, params, body}) {
  const action = {
    type: typeFromMethod(method),
    payload: {
      type,
      useDefaults: (method === 'GET' || method === 'POST')
    }
  }

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

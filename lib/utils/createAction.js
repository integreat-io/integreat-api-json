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

function createAction (method, {type, params = {}, body, relationship}) {
  const action = {
    type: typeFromMethod(method),
    payload: {
      type,
      useDefaults: (method === 'GET' || method === 'POST')
    }
  }

  const {id, ...restParams} = params
  if (id) {
    action.payload.id = id
  }
  if (restParams && Object.keys(restParams).length > 0) {
    action.payload.params = restParams
  }
  if (body) {
    action.payload.data = body.data || {}
  }

  return action
}

module.exports = createAction

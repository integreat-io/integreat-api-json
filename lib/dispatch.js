const mapRelFromApi = (rels = {}) => Object.keys(rels).reduce((obj, key) => ({...obj, [key]: rels[key].data}), {})
const mapItemFromApi = (item) => ({...item, relationships: mapRelFromApi(item.relationships)})
const mapFromApi = (data) => (Array.isArray(data)) ? data.map(mapItemFromApi) : mapItemFromApi(data)

const mapRelToApi = (rels = {}) => Object.keys(rels).reduce((obj, key) => ({...obj, [key]: {data: rels[key]}}), {})
const mapItemToApi = (item) => ({...item, relationships: mapRelToApi(item.relationships)})
const mapToApi = (data) => (Array.isArray(data)) ? data.map(mapItemToApi) : mapItemToApi(data)

function setupDispatch (dispatch) {
  return async (action) => {
    let {payload} = action
    if (payload.data) {
      payload = {...payload, data: mapFromApi(payload.data)}
    }
    const response = await dispatch({...action, payload})
    return (response.data) ? {...response, data: mapToApi(response.data)} : response
  }
}

module.exports = setupDispatch

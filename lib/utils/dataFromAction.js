const prepareRelationships = (rels) => Object.keys(rels)
  .reduce((obj, key) => ({...obj, [key]: {data: rels[key]}}), {})

function dataFromAction (data) {
  if (!data) {
    return data
  }

  return (data.relationships)
    ? {...data, relationships: prepareRelationships(data.relationships)}
    : data
}

module.exports = dataFromAction

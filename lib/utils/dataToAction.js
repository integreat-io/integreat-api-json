const prepareRelationships = (rels = {}) => Object.keys(rels)
  .reduce((obj, key) => ({...obj, [key]: rels[key].data}), {})

function dataToAction (data) {
  return {...data, relationships: prepareRelationships(data.relationships)}
}

module.exports = dataToAction

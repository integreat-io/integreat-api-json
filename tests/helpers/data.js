module.exports = {
  ent1: {
    id: 'ent1',
    type: 'entry',
    attributes: {
      title: 'Entry 1'
    },
    relationships: {
      author: {id: 'johnf', type: 'user'}
    }
  }
}

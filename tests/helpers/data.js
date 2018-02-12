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
  },

  johnf: {
    id: 'johnf',
    type: 'user',
    attributes: {
      name: 'John F.',
      tokens: ['twitter|23456']
    },
    relationships: {}
  }
}

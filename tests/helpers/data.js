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

  ent2: {
    id: 'ent2',
    type: 'entry',
    attributes: {
      title: 'Entry 2'
    },
    relationships: {
      author: {id: 'lucyk', type: 'user'}
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
  },

  lucyk: {
    id: 'lucyk',
    type: 'user',
    attributes: {
      name: 'Lucy K.',
      tokens: ['twitter|23457']
    },
    relationships: {}
  }
}

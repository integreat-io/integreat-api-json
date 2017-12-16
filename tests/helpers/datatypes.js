module.exports = {
  'entry': {
    id: 'entry',
    plural: 'entries',
    source: 'entries',
    attributes: {
      title: {type: 'string'}
    },
    relationships: {
      author: {type: 'user'}
    }
  },
  'user': {
    id: 'user',
    source: 'users',
    attributes: {
      name: {type: 'string'}
    }
  }
}

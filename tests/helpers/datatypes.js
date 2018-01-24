module.exports = [
  {
    id: 'entry',
    plural: 'entries',
    source: 'entries',
    attributes: {
      title: {type: 'string'}
    },
    relationships: {
      author: {type: 'user'},
      comments: {type: 'comment', query: {article: 'id'}}
    }
  },
  {
    id: 'user',
    source: 'users',
    attributes: {
      name: {type: 'string'}
    }
  },
  {
    id: 'comment',
    source: 'comments',
    attributes: {
      text: 'string'
    }
  }
]

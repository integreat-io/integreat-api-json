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
      name: {type: 'string'},
      tokens: 'string[]'
    },
    relationships: {},
    access: 'auth'
  },
  {
    id: 'comment',
    source: 'comments',
    attributes: {
      text: 'string'
    },
    relationships: {}
  },
  {
    id: 'page',
    source: 'pages',
    attributes: {
      title: 'string'
    },
    relationships: {
      comments: {type: 'comment', query: {article: 'id'}}
    }
  },
  {
    id: 'meta',
    source: 'store',
    internal: true,
    attributes: {
      lastUpdatedAt: 'date'
    },
    relationships: {}
  }
]

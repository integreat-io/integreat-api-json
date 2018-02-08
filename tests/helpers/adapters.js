const {ent1, johnf} = require('./data')

const createdAt = new Date('2018-01-03T12:22:11Z')
const updatedAt = new Date('2018-01-23T17:01:59Z')

const identityFn = (arg) => arg

const send = async ({type, params, action, data, relationship}) => {
  if (action === 'GET') {
    if (type === 'entry') {
      if (typeof params.id === 'undefined' || params.id === 'ent1') {
        return {
          status: 'ok',
          data: [{...ent1, attributes: {...ent1.attributes, createdAt, updatedAt}}]
        }
      }
    } else if (type === 'user' && (params.id === 'johnf' || params.tokens === 'twitter|23456')) {
      return {
        status: 'ok',
        data: [{...johnf, attributes: {...johnf.attributes, createdAt, updatedAt}}]
      }
    }
  }

  if (action === 'SET') {
    if (data.type === 'entry') {
      if (data.id === 'ent1') {
        return {
          status: 'ok',
          data: [{
            ...ent1,
            attributes: {...ent1.attributes, createdAt, updatedAt},
            relationships: {...ent1.relationships, comments: [{id: 'comment1', type: 'comment'}]}
          }]
        }
      } else if (data.id === 'ent2') {
        return {
          status: 'ok',
          data: [{
            id: 'ent2',
            type: 'entry',
            attributes: {title: 'Entry 2', createdAt, updatedAt},
            relationships: {author: {id: 'johnf', type: 'user'}}
          }]
        }
      }
    }
  }

  if (action === 'DELETE') {
    if (params.id === 'ent1') {
      return {status: 'ok'}
    }
  }

  return {status: 'notfound', error: 'Not found'}
}

const adapters = {
  mock: {
    prepareEndpoint: identityFn,
    send,
    normalize: identityFn,
    serialize: identityFn
  },
  none: {
    prepareEndpoint: identityFn
  }
}

module.exports = adapters

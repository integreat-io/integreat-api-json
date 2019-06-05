const { ent1, ent2, johnf, page1, page2, page3, page4, comment3, comment4 } = require('./data')

const createdAt = new Date('2018-01-03T12:22:11Z')
const updatedAt = new Date('2018-01-23T17:01:59Z')

const identityFn = (arg) => arg

const setDateAttrs = (data) => data.map((item) => ({
  ...item,
  attributes: { ...item.attributes, createdAt, updatedAt }
}))

const send = async ({ params, action, data, relationship }) => {
  if (action === 'GET') {
    if (params.type === 'entry') {
      if (params.id === 'ent1') {
        return {
          status: 'ok',
          data: setDateAttrs([ent1])
        }
      } else if (typeof params.id === 'undefined') {
        return {
          status: 'ok',
          data: setDateAttrs([ent1, ent2])
        }
      }
    } else if (params.type === 'user' && (params.id === 'johnf' || params.tokens === 'twitter|23456')) {
      return {
        status: 'ok',
        data: setDateAttrs([johnf])
      }
    } else if (params.type === 'page') {
      if (!params.pageAfter) {
        return {
          status: 'ok',
          data: setDateAttrs([page1, page2]),
          paging: {
            next: { type: 'page', pageSize: 2, pageAfter: 'page2' }
          }
        }
      } else if (params.pageAfter === 'page2') {
        return {
          status: 'ok',
          data: setDateAttrs([page3, page4]),
          paging: {
            next: { type: 'page', pageSize: 2, pageAfter: 'page4' }
          }
        }
      } else if (params.pageAfter === 'page4') {
        return {
          status: 'ok',
          data: setDateAttrs([]),
          paging: {
            next: null
          }
        }
      }
    } else if (params.type === 'comment') {
      if (params.pageAfter === 'comment2') {
        return {
          status: 'ok',
          data: setDateAttrs([comment3, comment4]),
          paging: {
            next: { type: 'comment', pageSize: 2, pageAfter: 'comment4' }
          }
        }
      }
    } else if (params.authCode === '12345') {
      return {
        status: 'ok',
        data: [{ body: { id: 'twitter|23456' } }]
      }
    }
  }

  if (action === 'SET') {
    if (data.type === 'entry') {
      if (data.id === 'ent1') {
        return {
          status: 'ok',
          data: setDateAttrs([{
            ...ent1,
            relationships: { ...ent1.relationships, comments: [{ id: 'comment1', type: 'comment' }] }
          }])
        }
      } else if (data.id === 'ent2') {
        return {
          status: 'ok',
          data: [{
            id: 'ent2',
            type: 'entry',
            attributes: { title: 'Entry 2', createdAt, updatedAt },
            relationships: { author: { id: 'johnf', type: 'user' } }
          }]
        }
      }
    }
  }

  if (action === 'DELETE') {
    if (params.id === 'ent1') {
      return { status: 'ok' }
    }
  }

  return { status: 'notfound', error: 'Not found' }
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

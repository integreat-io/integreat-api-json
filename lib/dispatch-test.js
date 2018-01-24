import test from 'ava'
import sinon from 'sinon'

import setupDispatch from './dispatch'

test('should call dispatch with mapped data', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: {relationships: {}}})
  const action = {
    type: 'SET',
    payload: {
      type: 'entry',
      data: {
        id: 'ent1',
        type: 'entry',
        attributes: {title: 'Entry 1'},
        relationships: {author: {data: {id: 'johnf', type: 'user'}}}
      }
    }
  }
  const expectedData = {
    id: 'ent1',
    type: 'entry',
    attributes: {title: 'Entry 1'},
    relationships: {author: {id: 'johnf', type: 'user'}}
  }

  await setupDispatch(dispatch)(action)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0].payload.data, expectedData)
})

test('should add meta.queue to SET actions', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: {relationships: {}}})
  const action = {
    type: 'SET',
    payload: {
      type: 'entry',
      data: {}
    }
  }

  await setupDispatch(dispatch)(action)

  t.is(dispatch.callCount, 1)
  t.true(dispatch.args[0][0].meta.queue)
})

test('should add meta.queue to DELETE actions', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: {relationships: {}}})
  const action = {
    type: 'DELETE',
    payload: {
      type: 'entry',
      data: {}
    }
  }

  await setupDispatch(dispatch)(action)

  t.is(dispatch.callCount, 1)
  t.true(dispatch.args[0][0].meta.queue)
})

test('should NOT add meta.queue to GET actions', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: {relationships: {}}})
  const action = {
    type: 'GET',
    payload: {
      type: 'entry'
    }
  }

  await setupDispatch(dispatch)(action)

  t.is(dispatch.callCount, 1)
  t.falsy(dispatch.args[0][0].meta)
})

test('should call dispatch with array of mapped data', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'ok', data: {relationships: {}}})
  const action = {
    type: 'SET',
    payload: {
      type: 'entry',
      data: [{id: 'ent1', type: 'entry', attributes: {}, relationships: {}}]
    }
  }
  const expectedData = [{id: 'ent1', type: 'entry', attributes: {}, relationships: {}}]

  await setupDispatch(dispatch)(action)

  t.is(dispatch.callCount, 1)
  t.deepEqual(dispatch.args[0][0].payload.data, expectedData)
})

test('should return mapped data', async (t) => {
  const dispatch = async () => ({
    status: 'ok',
    data: {
      id: 'ent1',
      type: 'entry',
      attributes: {title: 'Entry 1'},
      relationships: {author: {id: 'johnf', type: 'user'}}
    }
  })
  const expectedData = {
    id: 'ent1',
    type: 'entry',
    attributes: {title: 'Entry 1'},
    relationships: {author: {data: {id: 'johnf', type: 'user'}}}
  }
  const action = {type: 'SET', payload: {data: expectedData}}

  const ret = await setupDispatch(dispatch)(action)

  t.is(ret.status, 'ok')
  t.deepEqual(ret.data, expectedData)
})

test('should return array of mapped data', async (t) => {
  const dispatch = async () => ({
    status: 'ok',
    data: [{id: 'ent1', type: 'entry', attributes: {}, relationships: {}}]
  })
  const expectedData = [{
    id: 'ent1',
    type: 'entry',
    attributes: {},
    relationships: {}
  }]
  const action = {type: 'SET', payload: {data: expectedData}}

  const ret = await setupDispatch(dispatch)(action)

  t.is(ret.status, 'ok')
  t.deepEqual(ret.data, expectedData)
})

test('should not throw when no data', async (t) => {
  const dispatch = sinon.stub().resolves({status: 'notfound', error: 'Not found'})
  const action = {
    type: 'GET',
    payload: {
      type: 'entry'
    }
  }

  const ret = await setupDispatch(dispatch)(action)

  t.is(ret.status, 'notfound')
  t.is(typeof ret.data, 'undefined')
  t.is(dispatch.callCount, 1)
  t.is(typeof dispatch.args[0][0].payload.data, 'undefined')
})

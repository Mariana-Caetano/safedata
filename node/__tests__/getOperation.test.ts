import { getOperation } from '../middlewares/getOperation'

function getContext(id: string, method: string): unknown {
  return {
    vtex: {
      route: {
        id,
      },
      logger: { info: () => {} },
    },
    method,
    state: {},
  }
}

describe('getOperation', () => {
  it('POST /documents', async () => {
    const result = getContext('documents', 'POST') as Context

    await getOperation(result, async () => {})
    expect(result.state.operation).toBe('create')
  })

  it('invalid - POST /documents/{documentId}', async () => {
    const result = getContext('documentId', 'POST') as Context

    await getOperation(result, async () => {})
    expect(result.state.operation).toBeUndefined()
  })

  it('PATCH /documents/{documentId}', async () => {
    const result = getContext('documentId', 'PATCH') as Context

    await getOperation(result, async () => {})
    expect(result.state.operation).toBe('partialUpdate')
  })

  it('PUT /documents/{documentId}', async () => {
    const result = getContext('documentId', 'PUT') as Context

    await getOperation(result, async () => {})
    expect(result.state.operation).toBe('update')
  })

  it('GET /documents/{documentId}', async () => {
    const result = getContext('documentId', 'GET') as Context

    await getOperation(result, async () => {})
    expect(result.state.operation).toBe('read')
  })

  it('invalid - GET /documents', async () => {
    const result = getContext('documents', 'GET') as Context

    await getOperation(result, async () => {})
    expect(result.state.operation).toBeUndefined()
  })

  it('GET /search', async () => {
    const result = getContext('search', 'GET') as Context

    await getOperation(result, async () => {})
    expect(result.state.operation).toBe('read')
  })

  it('GET /scroll', async () => {
    const result = getContext('scroll', 'GET') as Context

    await getOperation(result, async () => {})
    expect(result.state.operation).toBe('read')
  })

  it('DELETE /documents/{documentId}', async () => {
    const result = getContext('documentId', 'DELETE') as Context

    await getOperation(result, async () => {})
    expect(result.state.operation).toBe('delete')
  })

  it('PATCH /documents', async () => {
    const result = getContext('documents', 'PATCH') as Context

    await getOperation(result, async () => {})
    expect(result.state.operation).toBe('create')
  })

  it('DELETE /documents', async () => {
    const result = getContext('documents', 'DELETE') as Context

    await getOperation(result, async () => {})
    expect(result.state.operation).toBeUndefined()
  })
})

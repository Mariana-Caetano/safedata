import adConfiguration from '../constants/adConfiguration'
import { validateDocumentId } from '../middlewares/validateDocumentId'
import { metricsMock } from './base'

function getContext({
  routeId,
  id,
  operation,
  dataEntity,
  entitySettings,
  client,
  document,
}: {
  routeId: string
  id: string | undefined
  operation?: string
  dataEntity?: string
  entitySettings?: EntityConfiguration
  client?: MasterDataEntity
  document?: MasterDataEntity
}): unknown {
  return {
    vtex: {
      logger: { info: () => {} },
      route: { id: routeId },
    },
    state: { id, operation, entitySettings, client, entity: dataEntity },
    clients: {
      masterdata: {
        getDocument: () => document,
      },
      ...metricsMock,
    },
  }
}

describe('validateDocumentId', () => {
  it('documentId route with no id', async () => {
    const context = getContext({
      routeId: 'documentId',
      id: undefined,
    }) as Context

    await validateDocumentId(context, async () => {})
    expect(context.status).toBe(400)
  })

  it('documentId route with id', async () => {
    const context = getContext({
      routeId: 'documentId',
      id: '123',
      operation: 'read',
    }) as Context

    let validated = false

    await validateDocumentId(context, async () => (validated = true))
    expect(validated).toBe(true)
  })

  it('documentId route with id and update operation', async () => {
    const context = getContext({
      routeId: 'documentId',
      id: '123',
      operation: 'update',
      dataEntity: 'AD',
      entitySettings: adConfiguration,
      client: {
        id: 'abc',
      },
      document: {
        userId: 'abc',
      },
    }) as Context

    let validated = false

    await validateDocumentId(context, async () => (validated = true))
    expect(validated).toBe(true)
  })

  it('documentId route with id and partial update operation', async () => {
    const context = getContext({
      routeId: 'documentId',
      id: '123',
      operation: 'partialUpdate',
      dataEntity: 'AD',
      entitySettings: adConfiguration,
      client: {
        id: 'abc',
      },
      document: {
        userId: 'abc',
      },
    }) as Context

    let validated = false

    await validateDocumentId(context, async () => (validated = true))
    expect(validated).toBe(true)
  })

  it('documentId route with id, update operation and wrong credentials', async () => {
    const context = getContext({
      routeId: 'documentId',
      id: '123',
      operation: 'update',
      dataEntity: 'AD',
      entitySettings: adConfiguration,
      client: {
        id: 'abc',
      },
      document: {
        userId: 'abcd',
      },
    }) as Context

    let validated = false

    await validateDocumentId(context, async () => (validated = true))
    expect(validated).toBe(false)
    expect(context.status).toBe(403)
  })

  it('documentId route with id, partial update operation and wrong credentials', async () => {
    const context = getContext({
      routeId: 'documentId',
      id: '123',
      operation: 'partialUpdate',
      dataEntity: 'AD',
      entitySettings: adConfiguration,
      client: {
        id: 'abc',
      },
      document: {
        userId: 'abcd',
      },
    }) as Context

    let validated = false

    await validateDocumentId(context, async () => (validated = true))
    expect(validated).toBe(false)
    expect(context.status).toBe(403)
  })
})

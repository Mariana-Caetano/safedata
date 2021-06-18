import clConfiguration from '../constants/clConfiguration'
import { validateLogin } from '../middlewares/validateLogin'
import { metricsMock } from './base'

function getContext({
  operation,
  entitySettings,
  isLoggedIn,
  route,
}: {
  operation: string
  entitySettings: EntityConfiguration
  isLoggedIn: boolean
  route: string
}): unknown {
  return {
    vtex: {
      logger: { info: () => {} },
      route: { id: route },
    },
    state: { operation, entitySettings, isLoggedIn },
    clients: { ...metricsMock },
  }
}

async function validateOperation({
  operation,
  isLoggedIn,
  route,
  canCreate = false,
}: {
  operation: string
  isLoggedIn: boolean
  route: string
  canCreate?: boolean
}) {
  const context = getContext({
    operation,
    entitySettings: { ...clConfiguration, canCreate },
    isLoggedIn,
    route,
  }) as Context

  let validated = false

  await validateLogin(context, async () => (validated = true))

  return validated
}

describe('validateLogin', () => {
  it('read operation, user is logged in', async () => {
    expect(
      await validateOperation({
        operation: 'read',
        isLoggedIn: true,
        route: 'documentId',
      })
    ).toBe(true)
  })

  it('read operation, user is not logged in', async () => {
    expect(
      await validateOperation({
        operation: 'read',
        isLoggedIn: false,
        route: 'documentId',
      })
    ).toBe(false)
  })

  it('update operation, user is logged in', async () => {
    expect(
      await validateOperation({
        operation: 'update',
        isLoggedIn: true,
        route: 'documentId',
      })
    ).toBe(true)
  })

  it('update operation, user is not logged in', async () => {
    expect(
      await validateOperation({
        operation: 'update',
        isLoggedIn: false,
        route: 'documentId',
      })
    ).toBe(false)
  })

  it('partial update operation, user is logged in', async () => {
    expect(
      await validateOperation({
        operation: 'partial',
        isLoggedIn: true,
        route: 'documentId',
      })
    ).toBe(true)
  })

  it('partial update operation, user is not logged in', async () => {
    expect(
      await validateOperation({
        operation: 'partial',
        isLoggedIn: false,
        route: 'documentId',
      })
    ).toBe(false)
  })

  it('delete operation, user is logged in', async () => {
    expect(
      await validateOperation({
        operation: 'delete',
        isLoggedIn: true,
        route: 'documentId',
      })
    ).toBe(true)
  })

  it('delete operation, user is not logged in', async () => {
    expect(
      await validateOperation({
        operation: 'delete',
        isLoggedIn: false,
        route: 'documentId',
      })
    ).toBe(false)
  })

  it('create operation, user is logged in', async () => {
    expect(
      await validateOperation({
        operation: 'create',
        isLoggedIn: true,
        route: 'documents',
      })
    ).toBe(true)
  })

  it('create operation, user is not logged in, can create anonymously', async () => {
    expect(
      await validateOperation({
        operation: 'create',
        isLoggedIn: false,
        route: 'documents',
        canCreate: true,
      })
    ).toBe(true)
  })

  it("create operation, user is not logged in, can't create anonymously", async () => {
    expect(
      await validateOperation({
        operation: 'create',
        isLoggedIn: false,
        route: 'documents',
        canCreate: false,
      })
    ).toBe(false)
  })
})

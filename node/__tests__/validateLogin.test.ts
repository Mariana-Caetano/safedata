import clConfiguration from '../constants/clConfiguration'
import { validateLogin } from '../middlewares/validateLogin'

function getContext({
  operation,
  entitySettings,
  isLoggedIn,
}: {
  operation: string
  entitySettings: EntityConfiguration
  isLoggedIn: boolean
}): unknown {
  return {
    vtex: {
      logger: { info: () => {} },
    },
    state: { operation, entitySettings, isLoggedIn },
  }
}

async function validateOperation(
  operation: string,
  isLoggedIn: boolean,
  canCreate = false
) {
  const context = getContext({
    operation,
    entitySettings: { ...clConfiguration, canCreate },
    isLoggedIn,
  }) as Context

  let validated = false

  await validateLogin(context, async () => (validated = true))

  return validated
}

describe('validateLogin', () => {
  it('read operation, user is logged in', async () => {
    expect(await validateOperation('read', true)).toBe(true)
  })

  it('read operation, user is not logged in', async () => {
    expect(await validateOperation('read', false)).toBe(false)
  })

  it('update operation, user is logged in', async () => {
    expect(await validateOperation('update', true)).toBe(true)
  })

  it('update operation, user is not logged in', async () => {
    expect(await validateOperation('update', false)).toBe(false)
  })

  it('partial update operation, user is logged in', async () => {
    expect(await validateOperation('partial', true)).toBe(true)
  })

  it('partial update operation, user is not logged in', async () => {
    expect(await validateOperation('partial', false)).toBe(false)
  })

  it('delete operation, user is logged in', async () => {
    expect(await validateOperation('delete', true)).toBe(true)
  })

  it('delete operation, user is not logged in', async () => {
    expect(await validateOperation('delete', false)).toBe(false)
  })

  it('create operation, user is logged in', async () => {
    expect(await validateOperation('create', true)).toBe(true)
  })

  it('create operation, user is not logged in, can create anonymously', async () => {
    expect(await validateOperation('create', false, true)).toBe(true)
  })

  it("create operation, user is not logged in, can't create anonymously", async () => {
    expect(await validateOperation('create', false, false)).toBe(false)
  })
})

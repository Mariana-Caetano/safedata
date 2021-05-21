import clConfiguration from '../constants/clConfiguration'
import { getClient } from '../middlewares/getClient'

function getContext({
  isLoggedIn,
  authenticatedUser,
  entity,
  entitySettings,
  items,
}: {
  isLoggedIn: boolean
  authenticatedUser?: AuthenticatedUser
  entity?: string
  entitySettings?: EntityConfiguration
  items?: MasterDataEntity[]
}): unknown {
  return {
    vtex: {
      logger: { info: () => {} },
    },
    state: {
      isLoggedIn,
      authenticatedUser,
      entity,
      entitySettings,
    },
    clients: {
      masterdata: {
        searchDocuments: () => items,
      },
    },
    query: {
      _fields: '',
    },
  }
}

describe('getClient', () => {
  it('user not logged in', async () => {
    const context = getContext({ isLoggedIn: false }) as Context

    await getClient(context, async () => {})
    expect(context.state.client).toBeUndefined()
  })

  it('user does not exist', async () => {
    const context = getContext({
      isLoggedIn: true,
      authenticatedUser: { user: 'test' },
      entity: 'CL',
      entitySettings: clConfiguration,
      items: [],
    }) as Context

    await getClient(context, async () => {})
    expect(context.state.client).toBeUndefined()
  })

  it('user exists', async () => {
    const context = getContext({
      isLoggedIn: true,
      authenticatedUser: { user: 'test' },
      entity: 'CL',
      entitySettings: clConfiguration,
      items: [{}],
    }) as Context

    await getClient(context, async () => {})
    expect(context.state.client).toStrictEqual({})
  })
})

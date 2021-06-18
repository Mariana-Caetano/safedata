// You can import your files here for testing them
//
import { getAuthInfo } from '../middlewares/getAuthInfo'

describe('getAuthInfo', () => {
  it('user not logged in', async () => {
    const context: unknown = {
      clients: {
        vtexid: {
          getAuthenticatedUser: () => Promise.resolve(undefined),
        },
      },
      vtex: {
        route: {
          params: {
            entity: 'CL',
            id: undefined,
          },
        },
        storeUserAuthToken: undefined,
      },
      state: {},
    }

    const result = context as Context

    await getAuthInfo(result, async () => {})

    expect(result.state.isLoggedIn).toBe(false)
    expect(result.state.authenticatedUser).toBeUndefined()
  })

  it('user is logged in', async () => {
    const context: unknown = {
      clients: {
        vtexid: {
          getAuthenticatedUser: (token: string) => {
            if (token === 'ABC') {
              return Promise.resolve({
                user: 'testuser@email.com',
              })
            }

            return Promise.resolve(undefined)
          },
        },
      },
      vtex: {
        route: {
          params: {
            entity: 'CL',
            id: undefined,
          },
        },
        storeUserAuthToken: 'ABC',
      },
      state: {},
    }

    const result = context as Context

    await getAuthInfo(result, async () => {})

    expect(result.state.isLoggedIn).toBe(true)
    expect(result.state.authenticatedUser?.user).toBe('testuser@email.com')
  })

  it('user has invalid token', async () => {
    const context: unknown = {
      clients: {
        vtexid: {
          getAuthenticatedUser: (token: string) => {
            if (token === 'ABC') {
              return Promise.resolve({
                user: 'testuser@email.com',
              })
            }

            return Promise.resolve(undefined)
          },
        },
      },
      vtex: {
        route: {
          params: {
            entity: 'CL',
            id: undefined,
          },
        },
        storeUserAuthToken: 'ABCD',
      },
      state: {},
    }

    const result = context as Context

    await getAuthInfo(result, async () => {})

    expect(result.state.isLoggedIn).toBe(false)
    expect(result.state.authenticatedUser?.user).toBeUndefined()
  })
})

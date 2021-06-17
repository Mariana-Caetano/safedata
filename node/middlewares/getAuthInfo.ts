import UserCache, { DEFAULT_USER_CACHE_MAX_AGE } from '../utils/userCache'

export async function getAuthInfo(ctx: Context, next: () => Promise<unknown>) {
  const {
    clients: { vtexid },
    vtex: {
      route: { params },
      storeUserAuthToken,
    },
  } = ctx

  const entity = params.entity as string
  const id = params.id as string
  const isLoggedIn = !!storeUserAuthToken

  let authenticatedUser: AuthenticatedUser | undefined

  if (storeUserAuthToken) {
    authenticatedUser = (await UserCache.getOrSet(storeUserAuthToken, () =>
      vtexid.getAuthenticatedUser(storeUserAuthToken).then((res) => {
        return {
          value: res,
          maxAge: DEFAULT_USER_CACHE_MAX_AGE,
        }
      })
    )) as AuthenticatedUser
  }

  ctx.state.entity = entity
  ctx.state.id = id
  ctx.state.isLoggedIn = isLoggedIn && authenticatedUser !== undefined
  ctx.state.authenticatedUser = authenticatedUser
  await next()
}

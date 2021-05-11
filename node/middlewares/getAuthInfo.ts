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
    authenticatedUser = await vtexid.getAuthenticatedUser(storeUserAuthToken)
  }

  ctx.state.entity = entity
  ctx.state.id = id
  ctx.state.isLoggedIn = isLoggedIn
  ctx.state.authenticatedUser = authenticatedUser
  await next()
}

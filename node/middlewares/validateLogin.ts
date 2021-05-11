import logResult from '../utils/log'

export async function validateLogin(
  ctx: Context,
  next: () => Promise<unknown>
) {
  const {
    state: { operation, entitySettings, isLoggedIn },
  } = ctx

  if (
    !isLoggedIn &&
    (operation !== 'create' ||
      (operation === 'create' && !entitySettings.canCreate))
  ) {
    ctx.status = 401
    logResult({ ctx, result: 'unauthorized', reason: 'user is not logged in' })
  }

  await next()
}

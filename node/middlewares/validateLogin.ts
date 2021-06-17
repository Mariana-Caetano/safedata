import logResult from '../utils/log'
import { incrementRequestCounter } from '../utils/requestCounters'

export async function validateLogin(
  ctx: Context,
  next: () => Promise<unknown>
) {
  const {
    state: { operation, entitySettings, isLoggedIn, entity },
    vtex: {
      account,
      route: { id: route },
    },
  } = ctx

  if (
    !isLoggedIn &&
    (operation !== 'create' ||
      (operation === 'create' && !entitySettings.canCreate))
  ) {
    ctx.status = 401
    logResult({ ctx, result: 'unauthorized', reason: 'user is not logged in' })

    incrementRequestCounter({
      operation,
      route,
      entity,
      account,
      statusCode: ctx.status,
    })

    return
  }

  await next()
}

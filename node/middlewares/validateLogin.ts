import { StatusCodes } from '../utils/httpUtils'
import { setContextResult } from '../utils/setContextResult'

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
    setContextResult({
      ctx,
      statusCode: StatusCodes.UNAUTHORIZED,
      logInfo: {
        needsLogging: true,
        logResult: 'unauthorized',
        logReason: `user is not logged in`,
      },
    })

    return
  }

  await next()
}

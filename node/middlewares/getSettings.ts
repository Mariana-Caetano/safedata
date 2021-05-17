import adConfiguration from '../constants/adConfiguration'
import clConfiguration from '../constants/clConfiguration'
import logResult from '../utils/log'

export async function getSettings(ctx: Context, next: () => Promise<unknown>) {
  const {
    clients: { apps },
    state: { entity },
  } = ctx

  const appSettings = (await apps.getAppSettings(
    process.env.VTEX_APP_ID as string
  )) as Settings

  let entitySettings =
    entity === 'CL'
      ? {
          ...clConfiguration,
          ...{ updateableFields: appSettings.updateableClientFields },
        }
      : appSettings.entityConfigurations?.find(
          (value) => entity === value.entityAcronym
        )

  if (!entitySettings && entity === 'AD') {
    entitySettings = adConfiguration
  }

  if (!entitySettings) {
    ctx.status = 403
    logResult({
      ctx,
      result: 'forbidden',
      reason: 'entity settings not configured',
    })

    return
  }

  ctx.state.entitySettings = entitySettings

  await next()
}

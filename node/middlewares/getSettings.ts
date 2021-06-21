import adConfiguration from '../constants/adConfiguration'
import clConfiguration from '../constants/clConfiguration'
import logResult from '../utils/log'
import SettingsCache, {
  DEFAULT_SETTINGS_CACHE_MAX_AGE_IN_MS,
} from '../utils/settingsCache'

export async function getSettings(ctx: Context, next: () => Promise<unknown>) {
  const {
    clients: { apps, metrics },
    state: { entity, operation },
    vtex: {
      account,
      route: { id: route },
    },
  } = ctx

  const cacheKey = `${ctx.vtex.account}-${ctx.vtex.workspace}-${process.env.VTEX_APP_ID}`

  const appSettings = (await SettingsCache.getOrSet(cacheKey, () =>
    apps.getAppSettings(process.env.VTEX_APP_ID as string).then((res) => {
      return {
        value: res,
        maxAge: DEFAULT_SETTINGS_CACHE_MAX_AGE_IN_MS,
      }
    })
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

    metrics.incrementRequestCounter({
      operation,
      route,
      entity,
      account,
      statusCode: ctx.status,
    })

    return
  }

  ctx.state.entitySettings = entitySettings

  await next()
}

import adConfiguration from '../constants/adConfiguration'
import clConfiguration from '../constants/clConfiguration'
import { StatusCodes } from '../utils/httpUtils'
import { setContextResult } from '../utils/setContextResult'
import SettingsCache, {
  DEFAULT_SETTINGS_CACHE_MAX_AGE_IN_MS,
} from '../utils/settingsCache'

export async function getSettings(ctx: Context, next: () => Promise<unknown>) {
  const {
    clients: { apps },
    state: { entity },
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
    setContextResult({
      ctx,
      statusCode: StatusCodes.FORBIDDEN,
      logInfo: {
        needsLogging: true,
        logResult: 'forbidden',
        logReason: `entity settings for entity ${entity} not configured`,
      },
    })

    return
  }

  ctx.state.entitySettings = entitySettings

  await next()
}

import {
  ClientCache,
  DEFAULT_CLIENT_CACHE_MAX_AGE_IN_MS,
} from '../utils/clientCache'
import { parseFields } from '../utils/fieldsParser'
import getCL from '../utils/getCL'

export async function getClient(ctx: Context, next: () => Promise<unknown>) {
  const {
    state: {
      authenticatedUser,
      entity: dataEntity,
      entitySettings,
      isLoggedIn,
    },
    clients: { masterdata },
  } = ctx

  const parsedFields = parseFields(ctx.query._fields)

  if (isLoggedIn) {
    const fieldsKey =
      dataEntity === 'CL'
        ? `${ctx.query._fields},${entitySettings.fieldToMatchOnClient}`
        : entitySettings.fieldToMatchOnClient

    const cacheKey = `${ctx.vtex.account}-${ctx.vtex.workspace}-${process.env.VTEX_APP_ID}-user-${authenticatedUser?.user}-${fieldsKey}`

    const client = await ClientCache.getOrSet(cacheKey, async () =>
      getCL(
        authenticatedUser?.user,
        masterdata,
        dataEntity === 'CL'
          ? [...parsedFields, entitySettings.fieldToMatchOnClient]
          : [entitySettings.fieldToMatchOnClient]
      ).then((res) => {
        return {
          maxAge: DEFAULT_CLIENT_CACHE_MAX_AGE_IN_MS,
          value: res,
        }
      })
    )

    if (client) {
      ctx.state.client = client
    }
  }

  await next()
}

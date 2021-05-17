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
    const client = await getCL(
      authenticatedUser?.user,
      masterdata,
      dataEntity === 'CL'
        ? [...parsedFields, entitySettings.fieldToMatchOnClient]
        : [entitySettings.fieldToMatchOnClient]
    )

    if (client) {
      ctx.state.client = client
    }
  }

  await next()
}

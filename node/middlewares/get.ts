import { parseFields } from '../utils/fieldsParser'
import getCL from '../utils/getCL'
import logResult from '../utils/log'

export async function get(ctx: Context, next: () => Promise<unknown>) {
  const {
    state: { entity: dataEntity, id, authenticatedUser, entitySettings },
    clients: { masterdata },
  } = ctx

  const parsedFields = parseFields(ctx.query._fields)
  const client = await getCL(
    authenticatedUser?.user,
    masterdata,
    dataEntity === 'CL'
      ? [...parsedFields, entitySettings.fieldToMatchOnClient]
      : [entitySettings.fieldToMatchOnClient]
  )

  const document =
    dataEntity === 'CL'
      ? client
      : ((await masterdata.getDocument({
          dataEntity,
          id,
          fields: parsedFields,
        })) as MasterDataEntity)

  if (!document) {
    ctx.status = 404
    logResult({
      ctx,
      result: 'notfound',
      reason: `document not found on entity ${dataEntity}: id ${id}`,
    })

    return
  }

  if (
    document &&
    client &&
    document[entitySettings?.fieldToMatchOnEntity] !==
      client[entitySettings?.fieldToMatchOnClient]
  ) {
    ctx.status = 403
    logResult({
      ctx,
      result: 'forbidden',
      reason: `document with matched field ${
        document[entitySettings?.fieldToMatchOnEntity]
      } does not belong to user ${client.email}`,
    })

    return
  }

  if (document === client) {
    const hasMatchedField = parsedFields.some((value) =>
      ['_all', entitySettings.fieldToMatchOnEntity].includes(value)
    )

    if (!hasMatchedField && document[entitySettings.fieldToMatchOnEntity]) {
      delete document[entitySettings.fieldToMatchOnEntity]
    }
  }

  ctx.body = document
  ctx.status = 200

  await next()
}

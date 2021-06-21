import { parseFields } from '../utils/fieldsParser'
import { setContextResult } from '../utils/setContextResult'

export async function get(ctx: Context, next: () => Promise<unknown>) {
  const {
    state: { entity: dataEntity, id, entitySettings, client },
    clients: { masterdata },
  } = ctx

  const parsedFields = parseFields(ctx.query._fields)

  const document =
    dataEntity === 'CL'
      ? client
      : ((await masterdata.getDocument({
          dataEntity,
          id,
          fields: [...parsedFields, entitySettings.fieldToMatchOnEntity],
        })) as MasterDataEntity)

  if (!document) {
    setContextResult({
      ctx,
      statusCode: 404,
      logInfo: {
        needsLogging: true,
        logResult: 'notfound',
        logReason: `document not found on entity ${dataEntity}: id ${id}`,
      },
    })

    return
  }

  if (
    document &&
    client &&
    document[entitySettings?.fieldToMatchOnEntity] !==
      client[entitySettings?.fieldToMatchOnClient]
  ) {
    setContextResult({
      ctx,
      statusCode: 403,
      logInfo: {
        needsLogging: true,
        logResult: 'forbidden',
        logReason: `document with matched field ${
          document[entitySettings?.fieldToMatchOnEntity]
        } does not belong to user ${
          client[entitySettings?.fieldToMatchOnClient]
        }`,
      },
    })

    return
  }

  const hasMatchedField = parsedFields.some((value) =>
    ['_all', entitySettings.fieldToMatchOnEntity].includes(value)
  )

  if (!hasMatchedField && document[entitySettings.fieldToMatchOnEntity]) {
    delete document[entitySettings.fieldToMatchOnEntity]
  }

  ctx.body = document
  ctx.set('cache-control', 'no-cache')

  setContextResult({
    ctx,
    statusCode: 200,
    logInfo: {
      needsLogging: false,
    },
  })

  await next()
}

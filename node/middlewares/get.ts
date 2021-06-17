import { parseFields } from '../utils/fieldsParser'
import logResult from '../utils/log'
import { incrementRequestCounter } from '../utils/requestCounters'

export async function get(ctx: Context, next: () => Promise<unknown>) {
  const {
    state: { entity: dataEntity, id, entitySettings, client, operation },
    clients: { masterdata },
    vtex: {
      account,
      route: { id: route },
    },
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
    ctx.status = 404
    logResult({
      ctx,
      result: 'notfound',
      reason: `document not found on entity ${dataEntity}: id ${id}`,
    })

    incrementRequestCounter({
      operation,
      route,
      entity: dataEntity,
      account,
      statusCode: ctx.status,
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
      } does not belong to user ${
        client[entitySettings?.fieldToMatchOnClient]
      }`,
    })

    incrementRequestCounter({
      operation,
      route,
      entity: dataEntity,
      account,
      statusCode: ctx.status,
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
  ctx.status = 200
  ctx.set('cache-control', 'no-cache')

  incrementRequestCounter({
    operation,
    route,
    entity: dataEntity,
    account,
    statusCode: ctx.status,
  })

  await next()
}

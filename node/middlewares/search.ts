import { parseFields } from '../utils/fieldsParser'
import logResult from '../utils/log'

export async function search(ctx: Context, next: () => Promise<unknown>) {
  const {
    state: { entity: dataEntity, client, entitySettings, operation },
    clients: { masterdata, metrics },
    vtex: {
      account,
      route: { id: route },
    },
  } = ctx

  const parsedFields = parseFields(ctx.query._fields)

  const documents =
    dataEntity === 'CL'
      ? [client]
      : await masterdata.searchDocuments<MasterDataEntity>({
          dataEntity,
          schema: ctx.query._schema,
          where:
            ctx.query._where ??
            `${entitySettings?.fieldToMatchOnEntity}=${
              client?.[entitySettings?.fieldToMatchOnClient]
            }`,
          sort: ctx.query._sort,
          fields: [...parsedFields, entitySettings.fieldToMatchOnEntity],
          pagination: {
            page: ctx.query._page ?? 1,
            pageSize: ctx.query._pageSize ?? 999,
          },
        })

  const validDocuments = documents.filter(
    (document) =>
      document &&
      client &&
      document[entitySettings?.fieldToMatchOnEntity] ===
        client[entitySettings?.fieldToMatchOnClient]
  )

  if (validDocuments.length === 0) {
    ctx.status = 404
    logResult({
      ctx,
      result: 'notfound',
      reason: `documents not found or they don't belong to user ${client?.email}. Entity: ${dataEntity} Query: ${ctx.querystring}`,
    })

    metrics.incrementRequestCounter({
      operation,
      route,
      entity: dataEntity,
      account,
      statusCode: ctx.status,
    })

    return
  }

  for (const document of documents) {
    const hasEntityField = parsedFields.some((value) =>
      ['_all', entitySettings?.fieldToMatchOnEntity].includes(value)
    )

    if (!hasEntityField && document) {
      delete document[entitySettings?.fieldToMatchOnEntity]
    }
  }

  ctx.body = validDocuments
  ctx.status = 200

  metrics.incrementRequestCounter({
    operation,
    route,
    entity: dataEntity,
    account,
    statusCode: ctx.status,
  })

  ctx.set('cache-control', 'no-cache')

  await next()
}

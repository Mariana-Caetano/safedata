import { parseFields } from '../utils/fieldsParser'
import getCL from '../utils/getCL'
import logResult from '../utils/log'

export async function search(ctx: Context, next: () => Promise<unknown>) {
  const {
    state: {
      entity: dataEntity,
      authenticatedUser,
      isLoggedIn,
      entitySettings,
    },
    clients: { masterdata },
  } = ctx

  if (!isLoggedIn) {
    ctx.status = 401
    logResult({ ctx, result: 'unauthorized', reason: 'user is not logged in' })

    return
  }

  const parsedFields = parseFields(ctx.query._fields)
  const client = await getCL(
    authenticatedUser?.user,
    masterdata,
    dataEntity === 'CL'
      ? [...parsedFields, entitySettings.fieldToMatchOnClient]
      : [entitySettings.fieldToMatchOnClient]
  )

  const documents =
    dataEntity === 'CL'
      ? [client]
      : await masterdata.searchDocuments<MasterDataEntity>({
          dataEntity,
          where:
            ctx.query._where ??
            `${entitySettings?.fieldToMatchOnEntity}=${
              client?.[entitySettings?.fieldToMatchOnClient]
            }`,
          sort: ctx.query._sort,
          fields: [...parsedFields, entitySettings.fieldToMatchOnEntity],
          pagination: {
            page: 1,
            pageSize: 999,
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

  await next()
}

import type { MasterData } from '@vtex/api'

import { parseFields } from '../utils/fieldsParser'

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

    return
  }

  if (!entitySettings) {
    ctx.status = 403

    return
  }

  const parsedFields = parseFields(ctx.query._fields)
  const client = await getCL(authenticatedUser?.user, masterdata)
  const documents =
    dataEntity === 'CL'
      ? [client]
      : await masterdata.searchDocuments<MasterDataEntity>({
          dataEntity,
          where: ctx.query._where,
          sort: ctx.query._sort,
          fields: [...parsedFields, entitySettings?.fieldToMatchOnEntity],
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

async function getCL(email: string | undefined, masterdata: MasterData) {
  if (!email) return undefined
  const document = await masterdata.searchDocuments<MasterDataEntity>({
    dataEntity: 'CL',
    where: `email=${email}`,
    fields: ['_all'],
    pagination: {
      page: 1,
      pageSize: 1,
    },
  })

  return document[0]
}

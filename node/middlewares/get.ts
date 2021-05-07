import type { MasterData } from '@vtex/api'

import { parseFields } from '../utils/fieldsParser'

export async function get(ctx: Context, next: () => Promise<unknown>) {
  const {
    state: {
      entity: dataEntity,
      id,
      authenticatedUser,
      isLoggedIn,
      entitySettings,
    },
    clients: { masterdata },
  } = ctx

  if (!id) {
    ctx.status = 400

    return
  }

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

    return
  }

  if (
    document &&
    client &&
    document[entitySettings?.fieldToMatchOnEntity] !==
      client[entitySettings?.fieldToMatchOnClient]
  ) {
    ctx.status = 403

    return
  }

  if (document === client) {
    const hasEmail = parsedFields.some((value) =>
      ['_all', 'email'].includes(value)
    )

    if (!hasEmail) delete document.email
  }

  ctx.body = document
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

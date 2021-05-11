import { json } from 'co-body'

import { parseFields } from '../utils/fieldsParser'
import getCL from '../utils/getCL'
import logResult from '../utils/log'

export async function create(ctx: Context, next: () => Promise<unknown>) {
  const {
    vtex: { logger },
    state: {
      entity: dataEntity,
      authenticatedUser,
      entitySettings,
      isLoggedIn,
    },
    clients: { masterdata },
  } = ctx

  const document = (await json(ctx.req)) as MasterDataEntity

  if (isLoggedIn) {
    const parsedFields = parseFields(ctx.query._fields)
    const client = await getCL(
      authenticatedUser?.user,
      masterdata,
      dataEntity === 'CL'
        ? [...parsedFields, entitySettings.fieldToMatchOnClient]
        : [entitySettings.fieldToMatchOnClient]
    )

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
        reason: `document to be created has invalid matching field ${
          entitySettings?.fieldToMatchOnEntity
        } - value ${
          document[entitySettings?.fieldToMatchOnEntity]
        } does not belong to user ${client.email}`,
      })

      return
    }
  } else {
    const matchingDocuments = await masterdata.searchDocuments<MasterDataEntity>(
      {
        dataEntity,
        fields: [entitySettings?.fieldToMatchOnEntity],
        where: `${entitySettings?.fieldToMatchOnEntity}=${
          document[entitySettings?.fieldToMatchOnEntity]
        }`,
        pagination: {
          page: 1,
          pageSize: 1,
        },
      }
    )

    if (matchingDocuments.length > 0) {
      ctx.status = 403
      logResult({
        ctx,
        result: 'forbidden',
        reason: `document to be created has invalid matching field ${
          entitySettings?.fieldToMatchOnEntity
        } - value ${
          document[entitySettings?.fieldToMatchOnEntity]
        } already belongs to a user`,
      })

      return
    }
  }

  try {
    await masterdata.createDocument({
      dataEntity,
      fields: document,
      schema: ctx.query._schema,
    })
  } catch (error) {
    logger.error(error)
    throw error
  }

  ctx.body = document
  ctx.status = 200

  await next()
}

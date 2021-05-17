import logResult from '../utils/log'

export async function create(ctx: Context, next: () => Promise<unknown>) {
  const {
    vtex: { logger },
    state: { entity: dataEntity, entitySettings, isLoggedIn, document },
    clients: { masterdata },
  } = ctx

  if (!isLoggedIn) {
    if (entitySettings.canCreate) {
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
    } else {
      ctx.status = 401
      logResult({
        ctx,
        result: 'unauthorized',
        reason: `can't create this entity without authentication: ${dataEntity}`,
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

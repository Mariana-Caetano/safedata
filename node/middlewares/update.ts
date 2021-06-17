import { incrementRequestCounter } from '../utils/requestCounters'

export async function update(ctx: Context, next: () => Promise<unknown>) {
  const {
    vtex: {
      logger,
      account,
      route: { id: route },
    },
    state: { entity: dataEntity, document, id, operation },
    clients: { masterdata },
  } = ctx

  try {
    await masterdata.updateEntireDocument({
      id,
      dataEntity,
      fields: document,
      schema: ctx.query._schema,
    })
  } catch (error) {
    logger.error(error)
    incrementRequestCounter({
      operation,
      route,
      entity: dataEntity,
      account,
      statusCode: 500,
    })
    throw error
  }

  ctx.body = document
  ctx.status = 200

  incrementRequestCounter({
    operation,
    route,
    entity: dataEntity,
    account,
    statusCode: ctx.status,
  })

  await next()
}

import { setContextResult } from '../utils/setContextResult'

export async function update(ctx: Context, next: () => Promise<unknown>) {
  const {
    state: { entity: dataEntity, document, id },
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
    setContextResult({
      ctx,
      statusCode: 500,
      logInfo: {
        needsLogging: true,
        logResult: 'invalid',
        logReason: error,
      },
    })
    throw error
  }

  ctx.body = document
  setContextResult({
    ctx,
    statusCode: 200,
    logInfo: {
      needsLogging: false,
    },
  })

  await next()
}

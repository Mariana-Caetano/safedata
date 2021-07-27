import { StatusCodes } from '../utils/httpUtils'
import { setContextResult } from '../utils/setContextResult'

export async function updatePartial(
  ctx: Context,
  next: () => Promise<unknown>
) {
  const {
    state: { entity: dataEntity, document, id },
    clients: { masterdata },
  } = ctx

  try {
    await masterdata.updatePartialDocument({
      id,
      dataEntity,
      fields: document,
      schema: ctx.query._schema,
    })
  } catch (error) {
    setContextResult({
      ctx,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
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
    statusCode: StatusCodes.OK,
    logInfo: {
      needsLogging: false,
    },
  })

  await next()
}

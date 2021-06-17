import logResult from '../utils/log'
import { incrementRequestCounter } from '../utils/requestCounters'

export async function validateDocumentId(
  ctx: Context,
  next: () => Promise<unknown>
) {
  const {
    vtex: {
      account,
      route: { id: route },
    },
    state: { id, operation, entitySettings, client, entity: dataEntity },
    clients: { masterdata },
  } = ctx

  if (route === 'documentId' && !id) {
    ctx.status = 400
    logResult({
      ctx,
      result: 'invalid',
      reason: 'id is missing in documentId route',
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

  if (['update', 'partialUpdate'].includes(operation)) {
    const documentToUpdate = await masterdata.getDocument<MasterDataEntity>({
      dataEntity,
      id,
      fields: [entitySettings.fieldToMatchOnEntity],
    })

    if (
      documentToUpdate &&
      documentToUpdate[entitySettings.fieldToMatchOnEntity] !==
        client[entitySettings.fieldToMatchOnClient]
    ) {
      ctx.status = 403
      logResult({
        ctx,
        result: 'forbidden',
        reason: `document has invalid matching field ${
          entitySettings?.fieldToMatchOnEntity
        } - value ${
          documentToUpdate[entitySettings?.fieldToMatchOnEntity]
        } does not belong to user ${client.email}`,
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
  }

  await next()
}

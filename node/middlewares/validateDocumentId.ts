import { setContextResult } from '../utils/setContextResult'

export async function validateDocumentId(
  ctx: Context,
  next: () => Promise<unknown>
) {
  const {
    vtex: {
      route: { id: route },
    },
    state: { id, operation, entitySettings, client, entity: dataEntity },
    clients: { masterdata },
  } = ctx

  if (route === 'documentId' && !id) {
    setContextResult({
      ctx,
      statusCode: 400,
      logInfo: {
        needsLogging: true,
        logResult: 'invalid',
        logReason: `id is missing in documentId route - ${ctx.url}`,
      },
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
      setContextResult({
        ctx,
        statusCode: 403,
        logInfo: {
          needsLogging: true,
          logResult: 'forbidden',
          logReason: `document has invalid matching field ${
            entitySettings?.fieldToMatchOnEntity
          } - value ${
            documentToUpdate[entitySettings?.fieldToMatchOnEntity]
          } does not belong to user ${client.email}`,
        },
      })

      return
    }
  }

  await next()
}

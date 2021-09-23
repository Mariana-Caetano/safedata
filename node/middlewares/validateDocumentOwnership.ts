import { StatusCodes } from '../utils/httpUtils'
import { setContextResult } from '../utils/setContextResult'

export async function validateDocumentOwnership(
  ctx: Context,
  next: () => Promise<unknown>
) {
  const {
    state: { entitySettings, isLoggedIn, document, operation, client },
  } = ctx

  if (isLoggedIn) {
    if (
      document &&
      client &&
      document[entitySettings?.fieldToMatchOnEntity] !==
        client[entitySettings?.fieldToMatchOnClient] &&
      (operation === 'update' || operation === 'create')
    ) {
      setContextResult({
        ctx,
        statusCode: StatusCodes.FORBIDDEN,
        logInfo: {
          needsLogging: true,
          logResult: 'forbidden',
          logReason: `document has invalid matching field ${
            entitySettings?.fieldToMatchOnEntity
          } - value ${
            document[entitySettings?.fieldToMatchOnEntity]
          } does not belong to user ${client.email}`,
        },
      })

      return
    }
  }

  await next()
}

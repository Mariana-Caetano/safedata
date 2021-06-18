import logResult from '../utils/log'

export async function validateDocumentOwnership(
  ctx: Context,
  next: () => Promise<unknown>
) {
  const {
    state: { entitySettings, isLoggedIn, document, operation, client, entity },
    vtex: {
      account,
      route: { id: route },
    },
    clients: { metrics },
  } = ctx

  if (isLoggedIn) {
    if (
      document &&
      client &&
      document[entitySettings?.fieldToMatchOnEntity] !==
        client[entitySettings?.fieldToMatchOnClient] &&
      (operation === 'update' || operation === 'create')
    ) {
      ctx.status = 403
      logResult({
        ctx,
        result: 'forbidden',
        reason: `document has invalid matching field ${
          entitySettings?.fieldToMatchOnEntity
        } - value ${
          document[entitySettings?.fieldToMatchOnEntity]
        } does not belong to user ${client.email}`,
      })

      metrics.incrementRequestCounter({
        operation,
        route,
        entity,
        account,
        statusCode: ctx.status,
      })

      return
    }
  }

  await next()
}

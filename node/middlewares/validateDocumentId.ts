import logResult from '../utils/log'

export async function validateDocumentId(
  ctx: Context,
  next: () => Promise<unknown>
) {
  const {
    vtex: {
      route: { id: routeId },
    },
    state: { id },
  } = ctx

  if (routeId === 'documentId' && !id) {
    ctx.status = 400
    logResult({
      ctx,
      result: 'invalid',
      reason: 'id is missing in documentId route',
    })
  }

  await next()
}

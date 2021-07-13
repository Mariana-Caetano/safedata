import log from '../utils/log'

export async function getOperation(ctx: Context, next: () => Promise<unknown>) {
  const {
    vtex: {
      route: { id },
    },
    method,
  } = ctx

  if (['documentId', 'search', 'scroll'].includes(id) && method === 'GET') {
    ctx.state.operation = 'read'
  } else if (id === 'documents' && ['PATCH', 'POST'].includes(method)) {
    ctx.state.operation = 'create'
  } else if (id === 'documentId' && ['PUT'].includes(method)) {
    ctx.state.operation = 'update'
  } else if (id === 'documentId' && ['PATCH'].includes(method)) {
    ctx.state.operation = 'partialUpdate'
  } else if (id === 'documentId' && method === 'DELETE') {
    ctx.state.operation = 'delete'
  } else {
    log({
      ctx,
      result: 'forbidden',
      reason: `invalid operation (route: ${id}, method: ${method}) `,
    })

    return
  }

  await next()
}

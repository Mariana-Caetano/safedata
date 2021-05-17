export async function update(ctx: Context, next: () => Promise<unknown>) {
  const {
    vtex: { logger },
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
    logger.error(error)
    throw error
  }

  ctx.body = document
  ctx.status = 200

  await next()
}

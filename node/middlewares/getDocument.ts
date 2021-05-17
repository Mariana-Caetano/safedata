import { json } from 'co-body'

export async function getDocument(ctx: Context, next: () => Promise<unknown>) {
  const document = (await json(ctx.req)) as MasterDataEntity

  ctx.state.document = document

  await next()
}

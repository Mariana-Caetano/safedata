export default function logResult({
  ctx,
  result,
  reason,
}: {
  ctx: Context
  result: 'unauthorized' | 'forbidden' | 'notfound' | 'invalid' | 'ok'
  reason: string
}) {
  ctx.vtex.logger.info({
    entity: ctx.state.entity,
    entitySettings: ctx.state.entitySettings,
    isLoggedIn: ctx.state.isLoggedIn,
    result,
    reason,
  })
}

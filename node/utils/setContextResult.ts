import log from './log'

export const setContextResult = ({
  ctx,
  statusCode,
  logInfo: { needsLogging, logResult, logReason },
}: {
  ctx: Context
  statusCode: number
  logInfo: {
    needsLogging: boolean
    logResult?: 'unauthorized' | 'forbidden' | 'notfound' | 'invalid' | 'ok'
    logReason?: string
  }
}) => {
  ctx.status = statusCode
  if (needsLogging && logResult) {
    log({
      ctx,
      result: logResult,
      reason: logReason ?? '',
    })
  }

  ctx.clients.metrics.incrementRequestCounter({
    operation: ctx.state.operation,
    route: ctx.vtex.route.id,
    entity: ctx.state.entity,
    account: ctx.vtex.account,
    statusCode,
  })
}

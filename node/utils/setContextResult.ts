import log from './log'
import type { OperationResult } from '../typings/operationResult'
import { isSuccessfulStatusCode } from './httpUtils'

export const setContextResult = ({
  ctx,
  statusCode,
  logInfo: { needsLogging, logResult, logReason },
}: {
  ctx: Context
  statusCode: number
  logInfo: {
    needsLogging: boolean
    logResult?: OperationResult
    logReason?: string
  }
}) => {
  ctx.state.result =
    logResult ?? (isSuccessfulStatusCode(statusCode) ? 'ok' : 'invalid')
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

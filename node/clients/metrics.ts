import { IOClient } from '@vtex/api'
import client from 'prom-client'

const RequestCounter = new client.Counter({
  name: 'safedata_request_total',
  help: 'hits on safedata',
  labelNames: ['account', 'entity', 'statusCode', 'operation'],
})

export default class Metrics extends IOClient {
  public incrementRequestCounter({
    operation,
    route,
    entity,
    account,
    statusCode,
  }: {
    operation: string
    route: string
    entity: string
    account: string
    statusCode: number
  }) {
    const label = { account, statusCode, entity }

    if (route === 'search') {
      RequestCounter.inc({ ...label, operation: 'search' })

      return
    }

    switch (operation) {
      case 'read':
        RequestCounter.inc({ ...label, operation: 'get' })
        break

      default:
        RequestCounter.inc({ ...label, operation })
        break
    }
  }
}

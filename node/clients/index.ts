import { IOClients } from '@vtex/api'

import VtexId from './vtexid'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get vtexid() {
    return this.getOrSet('vtexid', VtexId)
  }
}

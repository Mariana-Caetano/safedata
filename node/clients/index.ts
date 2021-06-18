import { IOClients } from '@vtex/api'
import { Checkout } from '@vtex/clients'

import Metrics from './metrics'
import Profile from './profile'
import VtexId from './vtexid'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get vtexid() {
    return this.getOrSet('vtexid', VtexId)
  }

  public get checkout() {
    return this.getOrSet('checkout', Checkout)
  }

  public get checkoutProfile() {
    return this.getOrSet('checkoutProfile', Profile)
  }

  public get metrics() {
    return this.getOrSet('request', Metrics)
  }
}

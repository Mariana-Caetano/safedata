import type { ClientsConfig, ServiceContext, RecorderState } from '@vtex/api'
import { LRUCache, method, Service } from '@vtex/api'

import { Clients } from './clients'
import { getAuthInfo } from './middlewares/getAuthInfo'
import { get } from './middlewares/get'
import { getSettings } from './middlewares/getSettings'
import { search } from './middlewares/search'
import { getOperation } from './middlewares/getOperation'
import { validateLogin } from './middlewares/validateLogin'
import { validateDocumentId } from './middlewares/validateDocumentId'

const TIMEOUT_MS = 800

// Create a LRU memory cache for the Status client.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.
const memoryCache = new LRUCache<string, never>({ max: 5000 })

metrics.trackCache('status', memoryCache)

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig<Clients> = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  implementation: Clients,
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    // This key will be merged with the default options and add this cache to our Status client.
    status: {
      memoryCache,
    },
  },
}

declare global {
  // We declare a global Context type just to avoid re-writing ServiceContext<Clients, State> in every handler and resolver
  type Context = ServiceContext<Clients, State>

  // The shape of our State object found in `ctx.state`. This is used as state bag to communicate between middlewares.
  interface State extends RecorderState {
    operation: 'create' | 'read' | 'update' | 'delete'
    entity: string
    entitySettings: EntityConfiguration
    id: string
    isLoggedIn: boolean
    authenticatedUser: AuthenticatedUser | undefined
  }
}

// Export a service that defines route handlers and client options.
export default new Service({
  clients,
  routes: {
    documentId: method({
      GET: [
        getAuthInfo,
        getSettings,
        getOperation,
        validateLogin,
        validateDocumentId,
        get,
      ],
    }),
    search: method({
      GET: [getAuthInfo, getSettings, getOperation, validateLogin, search],
    }),
  },
})

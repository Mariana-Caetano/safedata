import { LRUCache } from '@vtex/api'

import { FIVE_MINUTES_IN_MS } from './timeConstants'

export const DEFAULT_CLIENT_CACHE_MAX_AGE_IN_MS = FIVE_MINUTES_IN_MS
export const ClientCache = new LRUCache<string, MasterDataEntity | undefined>({
  max: 5000,
})
export default ClientCache

import { LRUCache } from '@vtex/api'

export const DEFAULT_CLIENT_CACHE_MAX_AGE = 1000 * 60 * 5
export const ClientCache = new LRUCache<string, MasterDataEntity | undefined>({
  max: 5000,
})
export default ClientCache

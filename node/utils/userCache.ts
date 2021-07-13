import { LRUCache } from '@vtex/api'

import { FIVE_MINUTES_IN_MS } from './timeConstants'

export const DEFAULT_USER_CACHE_MAX_AGE_IN_MS = FIVE_MINUTES_IN_MS
export const UserCache = new LRUCache<string, AuthenticatedUser>({
  max: 5000,
})
export default UserCache

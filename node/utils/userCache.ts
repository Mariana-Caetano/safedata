import { LRUCache } from '@vtex/api'

export const DEFAULT_USER_CACHE_MAX_AGE = 60 * 1000 * 5
export const UserCache = new LRUCache<string, AuthenticatedUser>({
  max: 5000,
})
export default UserCache

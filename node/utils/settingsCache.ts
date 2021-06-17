import { LRUCache } from '@vtex/api'

export const DEFAULT_SETTINGS_CACHE_MAX_AGE = 60 * 1000 * 5
export const SettingsCache = new LRUCache<string, Settings>({ max: 5000 })
export default SettingsCache

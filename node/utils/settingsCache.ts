import { LRUCache } from '@vtex/api'

import { FIVE_MINUTES_IN_MS } from './timeConstants'

export const DEFAULT_SETTINGS_CACHE_MAX_AGE_IN_MS = FIVE_MINUTES_IN_MS
export const SettingsCache = new LRUCache<string, Settings>({ max: 5000 })
export default SettingsCache

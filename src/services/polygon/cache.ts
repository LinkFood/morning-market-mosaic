
/**
 * Polygon.io API Cache Service
 * Handles caching API responses to reduce API usage and speed up the application
 */

// Cache TTL (Time To Live) settings
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  EXTENDED: 86400, // 24 hours
  INDEX_DATA: 300, // 5 minutes for index data
  MARKET_STATUS: 300, // 5 minutes for market status
  MARKET_HOLIDAYS: 86400, // 24 hours for market holidays
  TICKER_DETAILS: 3600, // 1 hour for ticker details
  SECTOR_PERFORMANCE: 300, // 5 minutes for sector performance
  MARKET_MOVERS: 300, // 5 minutes for market movers
  STOCK_SNAPSHOT: 60 // 1 minute for stock snapshots
};

// Simple in-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

// Cache storage
const cache: Record<string, CacheEntry> = {};

/**
 * Get data from cache if available and not expired
 * @param key Cache key
 * @param ttl TTL in seconds (optional)
 * @returns Cached data or null if not found or expired
 */
export function getCachedData<T>(key: string, ttl?: number): T | null {
  const entry = cache[key];
  
  if (!entry) {
    return null;
  }
  
  const now = Date.now();
  
  // Check if entry is expired
  if (ttl && now > entry.timestamp + (ttl * 1000)) {
    // Remove expired entry
    delete cache[key];
    return null;
  }
  
  console.log(`Using cached data for ${key}`);
  return entry.data as T;
}

/**
 * Cache data with expiration
 * @param key Cache key
 * @param data Data to cache
 * @param ttl TTL in seconds (optional)
 * @returns The cached data
 */
export function cacheData<T>(key: string, data: T, ttl = CACHE_TTL.MEDIUM): T {
  cache[key] = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + (ttl * 1000)
  };
  
  return data;
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  Object.keys(cache).forEach(key => {
    delete cache[key];
  });
}

/**
 * Get cache timestamp for a specific key
 * @param key Cache key
 * @returns Timestamp or null if not found
 */
export function getCacheTimestamp(key: string): number | null {
  const entry = cache[key];
  return entry ? entry.timestamp : null;
}

// Alias for backward compatibility
export const clearAllCache = clearCache;

export default {
  getCachedData,
  cacheData,
  clearCache,
  clearAllCache,
  getCacheTimestamp,
  CACHE_TTL
};

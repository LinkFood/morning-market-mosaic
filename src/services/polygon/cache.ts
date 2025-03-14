
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
  INDEX_DATA: 300 // 5 minutes for index data
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
export function getCachedData(key: string, ttl?: number): any | null {
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
  return entry.data;
}

/**
 * Cache data with expiration
 * @param key Cache key
 * @param data Data to cache
 * @param ttl TTL in seconds (optional)
 * @returns The cached data
 */
export function cacheData(key: string, data: any, ttl = CACHE_TTL.MEDIUM): any {
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

export default {
  getCachedData,
  cacheData,
  clearCache,
  CACHE_TTL
};

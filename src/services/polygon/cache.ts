
/**
 * Polygon.io API Cache Service
 * Handles caching API responses to reduce API usage and speed up the application
 */

// Simple in-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

// Cache storage
const cache: Record<string, CacheEntry> = {};

// Cache timestamp for last cache update
let lastCacheUpdate = Date.now();

/**
 * Add data to cache with expiration
 */
export function addToCache(key: string, data: any, ttlSeconds: number = 300) {
  const now = Date.now();
  
  cache[key] = {
    data,
    timestamp: now,
    expiresAt: now + (ttlSeconds * 1000)
  };
  
  // Update the cache timestamp
  lastCacheUpdate = now;
  
  return data;
}

/**
 * Get data from cache if it exists and is not expired
 */
export function getFromCache(key: string): any | null {
  const entry = cache[key];
  
  if (!entry) {
    return null;
  }
  
  const now = Date.now();
  
  // Check if entry is expired
  if (entry.expiresAt < now) {
    // Remove expired entry
    delete cache[key];
    return null;
  }
  
  return entry.data;
}

/**
 * Remove data from cache by key
 */
export function removeFromCache(key: string): boolean {
  if (cache[key]) {
    delete cache[key];
    return true;
  }
  
  return false;
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  Object.keys(cache).forEach(key => {
    delete cache[key];
  });
  
  // Update the cache timestamp
  lastCacheUpdate = Date.now();
}

/**
 * Get cache timestamp
 */
export function getCacheTimestamp(): number {
  return lastCacheUpdate;
}

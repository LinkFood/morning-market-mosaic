
/**
 * Polygon.io API Cache Management
 * Implements intelligent caching strategies
 */

// Default TTL values based on data type (in milliseconds)
export const CACHE_TTL = {
  // Long-lived data that rarely changes
  TICKER_DETAILS: 24 * 60 * 60 * 1000, // 24 hours
  MARKET_HOLIDAYS: 24 * 60 * 60 * 1000, // 24 hours
  
  // Medium-lived data that updates periodically
  INDEX_DATA: 60 * 60 * 1000, // 1 hour
  SECTOR_PERFORMANCE: 60 * 60 * 1000, // 1 hour
  
  // Short-lived data that updates frequently
  STOCK_SNAPSHOT: 5 * 60 * 1000, // 5 minutes
  MARKET_STATUS: 5 * 60 * 1000, // 5 minutes
  
  // Very short-lived data
  MARKET_MOVERS: 60 * 1000, // 1 minute
};

// Interface for cache items
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Get cached data if available and not expired
 * @param key Cache key
 * @param ttl Time-to-live in milliseconds
 * @returns Cached data or null if not found or expired
 */
export function getCachedData<T>(key: string, ttl: number): T | null {
  try {
    const cacheKey = `polygon_${key}`;
    const cachedItem = localStorage.getItem(cacheKey);
    
    if (cachedItem) {
      const parsedItem: CacheItem<T> = JSON.parse(cachedItem);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - parsedItem.timestamp < ttl) {
        console.log(`Using cached data for ${key}`);
        return parsedItem.data;
      } else {
        console.log(`Cache expired for ${key}`);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error retrieving cache for ${key}:`, error);
    return null;
  }
}

/**
 * Cache data with the specified key
 * @param key Cache key
 * @param data Data to cache
 */
export function cacheData<T>(key: string, data: T): void {
  try {
    const cacheKey = `polygon_${key}`;
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
  } catch (error) {
    console.error(`Error caching data for ${key}:`, error);
  }
}

/**
 * Check if a cache item exists and is not expired
 * @param key Cache key
 * @param ttl Time-to-live in milliseconds
 * @returns Whether cache is valid
 */
export function isCacheValid(key: string, ttl: number): boolean {
  try {
    const cacheKey = `polygon_${key}`;
    const cachedItem = localStorage.getItem(cacheKey);
    
    if (cachedItem) {
      const parsedItem: CacheItem<any> = JSON.parse(cachedItem);
      const now = Date.now();
      
      return now - parsedItem.timestamp < ttl;
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking cache for ${key}:`, error);
    return false;
  }
}

/**
 * Invalidate a specific cache item
 * @param key Cache key to invalidate
 */
export function invalidateCache(key: string): void {
  try {
    const cacheKey = `polygon_${key}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error(`Error invalidating cache for ${key}:`, error);
  }
}

/**
 * Clear all Polygon.io API cache data
 */
export function clearAllCache(): void {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('polygon_')) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Get cache timestamp for a specific key
 * @param key Cache key
 * @returns Date object of the cache timestamp or null if not found
 */
export function getCacheTimestamp(key: string): Date | null {
  try {
    const cacheKey = `polygon_${key}`;
    const cachedItem = localStorage.getItem(cacheKey);
    
    if (cachedItem) {
      const parsedItem: CacheItem<any> = JSON.parse(cachedItem);
      return new Date(parsedItem.timestamp);
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting cache timestamp for ${key}:`, error);
    return null;
  }
}

export default {
  getCachedData,
  cacheData,
  isCacheValid,
  invalidateCache,
  clearAllCache,
  getCacheTimestamp,
  CACHE_TTL
};

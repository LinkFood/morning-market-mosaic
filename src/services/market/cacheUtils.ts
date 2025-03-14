
/**
 * Cache utilities for market data services
 */
import { toast } from "sonner";

// Cache settings
const DEFAULT_CACHE_TTL = 60 * 1000; // 1 minute default
export const CACHE_TTL = {
  MARKET_STATUS: 60 * 1000, // 1 minute
  MARKET_INDICES: 2 * 60 * 1000, // 2 minutes
  MARKET_SECTORS: 5 * 60 * 1000, // 5 minutes
  MARKET_STOCKS: 2 * 60 * 1000, // 2 minutes
  MARKET_EVENTS: 10 * 60 * 1000, // 10 minutes
  MARKET_MOVERS: 3 * 60 * 1000, // 3 minutes
  EXTENDED_CACHE: 24 * 60 * 60 * 1000, // 24 hours for emergency fallback
};

// Cache structure
const inMemoryCache: Record<string, { data: any; timestamp: number }> = {};

// Cache keys by service
const cacheKeysByService: Record<string, string[]> = {};

/**
 * Get data from cache
 * @param key Cache key
 * @param ttl Time to live (ms)
 * @param allowExpiredData Whether to return expired data with a warning
 * @returns Cached data or null
 */
function getCachedData<T>(key: string, ttl = DEFAULT_CACHE_TTL, allowExpiredData = false): T | null {
  const cachedItem = inMemoryCache[key];
  
  if (!cachedItem) {
    return null;
  }
  
  const now = Date.now();
  const isExpired = now - cachedItem.timestamp > ttl;
  
  if (!isExpired) {
    return cachedItem.data;
  }
  
  // Return expired data if allowed
  if (allowExpiredData) {
    console.log(`Using expired cache for ${key} (${Math.round((now - cachedItem.timestamp) / 1000)}s old)`);
    return cachedItem.data;
  }
  
  return null;
}

/**
 * Store data in cache
 * @param key Cache key
 * @param data Data to cache
 * @param serviceName Optional service name for cache management
 */
function cacheData(key: string, data: any, serviceName?: string): void {
  inMemoryCache[key] = {
    data,
    timestamp: Date.now()
  };
  
  // Track cache key by service if provided
  if (serviceName) {
    if (!cacheKeysByService[serviceName]) {
      cacheKeysByService[serviceName] = [];
    }
    
    if (!cacheKeysByService[serviceName].includes(key)) {
      cacheKeysByService[serviceName].push(key);
    }
  }
}

/**
 * Clear cache for a specific service
 * @param serviceName Service name
 */
function clearServiceCache(serviceName: string): void {
  const keys = cacheKeysByService[serviceName] || [];
  
  keys.forEach(key => {
    delete inMemoryCache[key];
  });
  
  cacheKeysByService[serviceName] = [];
}

/**
 * Clear entire cache
 */
function clearAllCache(): void {
  for (const key in inMemoryCache) {
    delete inMemoryCache[key];
  }
  
  for (const service in cacheKeysByService) {
    cacheKeysByService[service] = [];
  }
}

/**
 * Get timestamp for cached data
 * @param key Cache key
 * @returns Date object or null
 */
function getCacheTimestamp(key: string): Date | null {
  const cachedItem = inMemoryCache[key];
  
  if (!cachedItem) {
    return null;
  }
  
  return new Date(cachedItem.timestamp);
}

/**
 * Fetch data with cache
 * @param cacheKey Cache key
 * @param fetchFn Function to fetch data if not cached
 * @param allowExpiredData Whether to return expired data with a warning
 * @param ttl Time to live (ms)
 * @returns Cached or fetched data
 */
async function fetchWithCache<T>(
  cacheKey: string, 
  fetchFn: (() => Promise<T>) | null,
  allowExpiredData = false,
  ttl = DEFAULT_CACHE_TTL
): Promise<T | null> {
  // Check cache first
  const cachedData = getCachedData<T>(cacheKey, ttl, allowExpiredData);
  
  if (cachedData) {
    return cachedData;
  }
  
  // If no fetch function provided, just return null
  if (!fetchFn) {
    return null;
  }
  
  try {
    // Fetch fresh data
    const data = await fetchFn();
    
    // Cache the result
    if (data) {
      cacheData(cacheKey, data);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching data for cache key ${cacheKey}:`, error);
    
    // On error, check if we can use expired data as fallback
    if (allowExpiredData) {
      const expiredData = getCachedData<T>(cacheKey, Infinity);
      if (expiredData) {
        console.log(`Using expired cache as fallback for ${cacheKey}`);
        return expiredData;
      }
    }
    
    throw error;
  }
}

export default {
  getCachedData,
  cacheData,
  clearServiceCache,
  clearAllCache,
  getCacheTimestamp,
  fetchWithCache
};

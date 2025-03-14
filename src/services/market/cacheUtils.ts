
/**
 * Cache utilities for market data services
 */
import { toast } from "sonner";

// Cache TTL defaults (in milliseconds)
const DEFAULT_TTL = 300000; // 5 minutes
const EXTENDED_TTL = 1800000; // 30 minutes
const STALE_TTL = 86400000; // 24 hours (data considered stale but potentially usable)

// In-memory cache storage
const cache: {
  [key: string]: {
    data: any;
    timestamp: number;
    service?: string;
  };
} = {};

// Cache service registry
const serviceRegistry: { [service: string]: string[] } = {};

/**
 * Fetch data with caching
 * @param key Cache key
 * @param fetcher Optional fetcher function
 * @param allowExpiredData Whether to allow expired data
 * @param ttl Time to live in milliseconds
 */
async function fetchWithCache<T>(
  key: string,
  fetcher: (() => Promise<T>) | null = null,
  allowExpiredData = false,
  ttl = DEFAULT_TTL
): Promise<T | null> {
  const cachedItem = cache[key];
  const now = Date.now();

  // If we have valid cache, return it
  if (cachedItem && now - cachedItem.timestamp < ttl) {
    return cachedItem.data;
  }

  // If we allow expired data and have it, return it
  if (allowExpiredData && cachedItem) {
    console.log(`Using stale data for ${key}, age: ${Math.round((now - cachedItem.timestamp) / 1000)}s`);
    return cachedItem.data;
  }

  // If no fetcher provided, return null
  if (!fetcher) {
    return null;
  }

  try {
    // Fetch fresh data
    const freshData = await fetcher();
    
    // Cache the result
    cacheData(key, freshData);
    
    return freshData;
  } catch (error) {
    console.error(`Cache fetcher error for ${key}:`, error);
    
    // If we have expired data and an error occurred, return the expired data as fallback
    if (cachedItem) {
      console.log(`Using stale data as fallback for ${key} after error`);
      return cachedItem.data;
    }
    
    throw error;
  }
}

/**
 * Cache data with an optional service name
 * @param key Cache key
 * @param data Data to cache
 * @param serviceName Optional service name for grouping
 */
function cacheData(key: string, data: any, serviceName?: string) {
  cache[key] = {
    data,
    timestamp: Date.now(),
    service: serviceName
  };
  
  // Register in service registry if service name provided
  if (serviceName) {
    if (!serviceRegistry[serviceName]) {
      serviceRegistry[serviceName] = [];
    }
    
    if (!serviceRegistry[serviceName].includes(key)) {
      serviceRegistry[serviceName].push(key);
    }
  }
}

/**
 * Clear cache for a specific service
 * @param serviceName Service name to clear
 */
function clearServiceCache(serviceName: string) {
  const keys = serviceRegistry[serviceName] || [];
  let count = 0;
  
  keys.forEach(key => {
    if (cache[key]) {
      delete cache[key];
      count++;
    }
  });
  
  // Reset service registry
  serviceRegistry[serviceName] = [];
  
  if (count > 0) {
    console.log(`Cleared ${count} cache entries for service: ${serviceName}`);
    toast.info(`Refreshed ${serviceName} data`);
  }
  
  return count;
}

/**
 * Get cache timestamp
 * @param key Cache key
 */
function getCacheTimestamp(key: string): Date | null {
  const cachedItem = cache[key];
  if (cachedItem) {
    return new Date(cachedItem.timestamp);
  }
  return null;
}

/**
 * Get cache age in seconds
 * @param key Cache key
 */
function getCacheAge(key: string): number | null {
  const cachedItem = cache[key];
  if (cachedItem) {
    return Math.round((Date.now() - cachedItem.timestamp) / 1000);
  }
  return null;
}

/**
 * Clear all cache data
 */
function clearAllCacheData() {
  const keyCount = Object.keys(cache).length;
  
  // Clear the cache
  for (const key in cache) {
    delete cache[key];
  }
  
  // Reset service registry
  for (const service in serviceRegistry) {
    serviceRegistry[service] = [];
  }
  
  console.log(`Cleared all cache data (${keyCount} entries)`);
  toast.info("All market data refreshed");
  
  return keyCount;
}

/**
 * Get a summary of the cache
 */
function getCacheSummary() {
  const services: { [service: string]: number } = {};
  let uncategorized = 0;
  
  // Count items by service
  for (const key in cache) {
    const item = cache[key];
    if (item.service) {
      services[item.service] = (services[item.service] || 0) + 1;
    } else {
      uncategorized++;
    }
  }
  
  return {
    totalItems: Object.keys(cache).length,
    services,
    uncategorized
  };
}

export default {
  fetchWithCache,
  cacheData,
  clearServiceCache,
  getCacheTimestamp,
  getCacheAge,
  clearAllCacheData,
  getCacheSummary,
  DEFAULT_TTL,
  EXTENDED_TTL,
  STALE_TTL
};

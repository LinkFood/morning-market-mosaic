import { toast } from "sonner";

// Cache TTL in milliseconds (1 day)
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Interface for cache items
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Fetch with caching utility
async function fetchWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    // Check if data exists in cache and is still valid
    const cachedItem = localStorage.getItem(cacheKey);
    
    if (cachedItem) {
      const parsedItem: CacheItem<T> = JSON.parse(cachedItem);
      const now = Date.now();
      
      // If cache is still valid, return the cached data
      if (now - parsedItem.timestamp < CACHE_TTL) {
        console.log(`Using cached data for ${cacheKey}`);
        return parsedItem.data;
      }
    }
    
    // If no valid cache exists, fetch new data
    console.log(`Fetching fresh data for ${cacheKey}`);
    const data = await fetcher();
    
    // Store in cache
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${cacheKey}:`, error);
    
    // If error occurs but we have cached data, return that even if expired
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      toast.error("Using cached data due to API error");
      return JSON.parse(cachedItem).data;
    }
    
    // Otherwise, throw the error to be handled by the caller
    throw error;
  }
}

// Clear all cache data
function clearAllCacheData() {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("market_") || key.startsWith("econ_")) {
      localStorage.removeItem(key);
    }
  });
  toast.success("Cache cleared, refreshing data");
}

// Get cache timestamp for a specific key
function getCacheTimestamp(cacheKey: string): Date | null {
  const cachedItem = localStorage.getItem(cacheKey);
  if (cachedItem) {
    const parsedItem = JSON.parse(cachedItem);
    return new Date(parsedItem.timestamp);
  }
  return null;
}

export default {
  fetchWithCache,
  clearAllCacheData,
  getCacheTimestamp
};

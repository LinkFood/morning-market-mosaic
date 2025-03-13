
/**
 * Cache utilities for market data
 * Implements intelligent caching to reduce API calls
 */

// Cache TTL (Time To Live) settings
const CACHE_TTL = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  EXTENDED: 24 * 60 * 60 * 1000 // 24 hours
};

// Cache keys
const CACHE_KEYS = {
  MARKET_INDICES: "market_indices",
  MARKET_SECTORS: "market_sectors",
  MARKET_STOCKS: "market_stocks_",
  STOCK_SPARKLINE: "market_sparkline_",
  MARKET_STATUS: "market_status",
  MARKET_MOVERS: "market_movers_",
  STOCK_DETAILS: "stock_details_",
  MARKET_EVENTS: "market_events",
  STOCK_CANDLES: "stock_candles_"
};

/**
 * Fetch data with cache support
 * @param cacheKey The key to store/retrieve cache
 * @param fetcher Function to fetch fresh data if cache is invalid
 * @returns Promise with data (from cache or freshly fetched)
 */
async function fetchWithCache<T>(cacheKey: string, fetcher: () => Promise<T>): Promise<T> {
  try {
    // Check if data is in cache
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      
      // Determine TTL based on cache key
      let ttl = CACHE_TTL.MEDIUM; // Default TTL
      
      if (cacheKey.startsWith(CACHE_KEYS.MARKET_MOVERS)) {
        ttl = CACHE_TTL.SHORT;
      } else if (
        cacheKey.startsWith(CACHE_KEYS.MARKET_INDICES) ||
        cacheKey.startsWith(CACHE_KEYS.MARKET_STATUS)
      ) {
        ttl = CACHE_TTL.MEDIUM;
      } else if (
        cacheKey.startsWith(CACHE_KEYS.MARKET_SECTORS) ||
        cacheKey.startsWith(CACHE_KEYS.MARKET_STOCKS)
      ) {
        ttl = CACHE_TTL.LONG;
      } else if (cacheKey.startsWith(CACHE_KEYS.STOCK_DETAILS)) {
        ttl = CACHE_TTL.EXTENDED;
      }
      
      // Check if cache is still valid
      if (now - timestamp < ttl) {
        console.log(`Using cached data for ${cacheKey}`);
        return data;
      }
      
      console.log(`Cache expired for ${cacheKey}`);
    }
    
    // Fetch fresh data
    const freshData = await fetcher();
    
    // Save to cache
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: freshData,
        timestamp: Date.now()
      })
    );
    
    return freshData;
  } catch (error) {
    console.error(`Error in fetchWithCache for ${cacheKey}:`, error);
    throw error;
  }
}

/**
 * Clear all cache data
 */
function clearAllCacheData(): void {
  Object.keys(localStorage).forEach(key => {
    if (
      key.startsWith(CACHE_KEYS.MARKET_INDICES) ||
      key.startsWith(CACHE_KEYS.MARKET_SECTORS) ||
      key.startsWith(CACHE_KEYS.MARKET_STOCKS) ||
      key.startsWith(CACHE_KEYS.STOCK_SPARKLINE) ||
      key.startsWith(CACHE_KEYS.MARKET_STATUS) ||
      key.startsWith(CACHE_KEYS.MARKET_MOVERS) ||
      key.startsWith(CACHE_KEYS.STOCK_DETAILS) ||
      key.startsWith(CACHE_KEYS.MARKET_EVENTS) ||
      key.startsWith(CACHE_KEYS.STOCK_CANDLES)
    ) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Get the timestamp of when data was cached
 * @param cacheKey The cache key to check
 * @returns Date object or null if not cached
 */
function getCacheTimestamp(cacheKey: string): Date | null {
  const cachedData = localStorage.getItem(cacheKey);
  
  if (cachedData) {
    const { timestamp } = JSON.parse(cachedData);
    return new Date(timestamp);
  }
  
  return null;
}

export default {
  fetchWithCache,
  clearAllCacheData,
  getCacheTimestamp,
  CACHE_KEYS
};

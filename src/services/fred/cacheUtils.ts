import { toast } from "sonner";
import { CACHE_TTL, ECONOMIC_CATEGORIES } from "./constants";
import { CacheItem } from "./types";

/**
 * Saves data to local storage with a timestamp
 * Handles storage quota errors by removing oldest items
 */
export function cacheData<T>(cacheKey: string, data: T): void {
  try {
    const serializedData = JSON.stringify({
      data,
      timestamp: Date.now(),
    });
    
    localStorage.setItem(cacheKey, serializedData);
    console.log(`Cached ${cacheKey} with ${serializedData.length} bytes of data`);
  } catch (error) {
    console.error(`Failed to cache ${cacheKey}:`, error);
    
    // Handle quota exceeded errors by clearing older caches
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Find all FRED cache keys
      const fredKeys = Object.keys(localStorage).filter(key => key.startsWith('fred_'));
      if (fredKeys.length > 0) {
        // Remove the oldest cached item
        const oldestKey = fredKeys.reduce((oldest, key) => {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '{}');
            const oldestItem = JSON.parse(localStorage.getItem(oldest) || '{"timestamp": Infinity}');
            return (item.timestamp || 0) < (oldestItem.timestamp || 0) ? key : oldest;
          } catch (e) {
            return oldest; // If parse fails, keep the current oldest
          }
        }, fredKeys[0]);
        
        console.log(`Removing oldest cache item ${oldestKey} to make space`);
        localStorage.removeItem(oldestKey);
        
        // Try caching again
        try {
          const retrySerializedData = JSON.stringify({
            data,
            timestamp: Date.now(),
          });
          localStorage.setItem(cacheKey, retrySerializedData);
          console.log(`Successfully cached ${cacheKey} after removing oldest item`);
        } catch (retryError) {
          console.error('Still failed to cache after clearing space:', retryError);
          toast.error("Failed to store data in cache");
        }
      }
    }
  }
}

/**
 * Retrieves cached data if it exists and is not expired
 * @returns The cached data or null if not found or expired
 */
export function getCachedData<T>(cacheKey: string, ttl: number): CacheItem<T> | null {
  const cachedItem = localStorage.getItem(cacheKey);
  
  if (cachedItem) {
    try {
      const parsedItem: CacheItem<T> = JSON.parse(cachedItem);
      const now = Date.now();
      const age = now - parsedItem.timestamp;
      
      if (age < ttl) {
        console.log(`Using cached FRED data for ${cacheKey} (age: ${Math.round(age/1000)}s, ttl: ${Math.round(ttl/1000)}s)`);
        return parsedItem;
      } else {
        console.log(`Cache expired for ${cacheKey} (age: ${Math.round(age/1000)}s, ttl: ${Math.round(ttl/1000)}s)`);
      }
    } catch (error) {
      console.error(`Error parsing cached data for ${cacheKey}:`, error);
    }
  }
  
  return null;
}

/**
 * Get cache timestamp for a specific key
 */
export function getFredCacheTimestamp(cacheKey: string): Date | null {
  const cachedItem = localStorage.getItem(cacheKey);
  if (cachedItem) {
    try {
      const parsedItem = JSON.parse(cachedItem);
      return new Date(parsedItem.timestamp);
    } catch (error) {
      console.error(`Error parsing cache timestamp for ${cacheKey}:`, error);
      return null;
    }
  }
  return null;
}

/**
 * Clear all FRED cache data
 */
export function clearFredCacheData(): number {
  let count = 0;
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("fred_")) {
      localStorage.removeItem(key);
      count++;
    }
  });
  console.log(`Cleared ${count} FRED data cache items`);
  toast.success("FRED data cache cleared, refreshing data");
  return count;
}

/**
 * Get cache stats (usage, count, etc)
 */
export function getFredCacheStats() {
  let totalBytes = 0;
  let count = 0;
  const itemStats = [];
  
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("fred_")) {
      const item = localStorage.getItem(key);
      const bytes = item ? new Blob([item]).size : 0;
      totalBytes += bytes;
      count++;
      
      try {
        const parsed = JSON.parse(item || '{}');
        const timestamp = parsed.timestamp ? new Date(parsed.timestamp) : null;
        
        itemStats.push({
          key,
          bytes,
          timestamp,
          age: timestamp ? Math.round((Date.now() - timestamp.getTime()) / 1000) : null
        });
      } catch (e) {
        itemStats.push({ key, bytes, error: 'Invalid JSON' });
      }
    }
  });
  
  return {
    totalItems: count,
    totalBytes,
    averageBytes: count > 0 ? Math.round(totalBytes / count) : 0,
    items: itemStats
  };
}

/**
 * Determine cache TTL based on category
 */
export function getCategoryTTL(category: string): number {
  switch (category.toUpperCase()) {
    case ECONOMIC_CATEGORIES.INTEREST_RATES:
    case ECONOMIC_CATEGORIES.MARKETS:
      return CACHE_TTL.DAILY;
    case ECONOMIC_CATEGORIES.EMPLOYMENT:
      return CACHE_TTL.WEEKLY;
    default:
      return CACHE_TTL.MONTHLY;
  }
}

/**
 * Determine cache TTL based on series ID
 */
export function getSeriesTTL(seriesId: string): number {
  // Daily updated series
  if (['FEDFUNDS', 'DGS10', 'DGS2', 'T10Y2Y', 'T10YIE', 'SP500', 'VIXCLS'].includes(seriesId)) {
    return CACHE_TTL.DAILY;
  }
  
  // Weekly updated series
  if (['ICSA'].includes(seriesId)) {
    return CACHE_TTL.WEEKLY;
  }
  
  // Default to monthly
  return CACHE_TTL.MONTHLY;
}

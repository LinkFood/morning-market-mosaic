
import { toast } from "sonner";
import { CACHE_TTL, ECONOMIC_CATEGORIES } from "./constants";
import { CacheItem } from "./types";

/**
 * Saves data to local storage with a timestamp
 */
export function cacheData<T>(cacheKey: string, data: T): void {
  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    })
  );
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
      
      if (now - parsedItem.timestamp < ttl) {
        console.log(`Using cached FRED data for ${cacheKey}`);
        return parsedItem;
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

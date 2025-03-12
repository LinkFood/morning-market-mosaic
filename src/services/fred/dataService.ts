
import { toast } from "sonner";
import { invokeFredFunction } from "./apiClient";
import { 
  getCachedData, 
  cacheData, 
  getCategoryTTL, 
  getSeriesTTL 
} from "./cacheUtils";
import { CacheItem, TimeSpan } from "./types";

/**
 * Fetch with caching utility that includes timeout
 */
export async function fetchWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl: number,
  forceRefresh: boolean = false
): Promise<T> {
  try {
    // Check cache first unless forceRefresh is true
    if (!forceRefresh) {
      const cachedItem = getCachedData<T>(cacheKey, ttl);
      if (cachedItem) {
        return cachedItem.data;
      }
    }
    
    // If no valid cache exists or forceRefresh is true, fetch new data
    console.log(`Fetching fresh FRED data for ${cacheKey}`);
    const data = await fetcher();
    
    // Store in cache
    cacheData(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${cacheKey}:`, error);
    
    // If error occurs but we have cached data, return that even if expired
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      console.log(`Using expired cache for ${cacheKey} due to error`);
      toast.warning("Using cached data due to API error");
      return JSON.parse(cachedItem).data;
    }
    
    throw error;
  }
}

/**
 * Get data for a specific economic category
 */
export async function getEconomicCategory(
  category: string, 
  timeSpan: number = TimeSpan.FIVE_YEARS,
  forceRefresh: boolean = false
) {
  console.log(`Getting data for category: ${category}, timeSpan: ${timeSpan} months, forceRefresh: ${forceRefresh}`);
  return fetchWithCache(
    `fred_${category.toLowerCase()}_${timeSpan}`,
    async () => invokeFredFunction({ category, timeSpan, forceRefresh }),
    getCategoryTTL(category),
    forceRefresh
  );
}

/**
 * Get data for a specific series
 */
export async function getEconomicSeries(
  seriesId: string, 
  timeSpan: number = TimeSpan.FIVE_YEARS,
  forceRefresh: boolean = false
) {
  console.log(`Getting data for series: ${seriesId}, timeSpan: ${timeSpan} months, forceRefresh: ${forceRefresh}`);
  return fetchWithCache(
    `fred_series_${seriesId}_${timeSpan}`,
    async () => invokeFredFunction({ seriesId, timeSpan, forceRefresh }),
    getSeriesTTL(seriesId),
    forceRefresh
  );
}

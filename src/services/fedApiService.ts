
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define API endpoints
const SUPABASE_FRED_FUNCTION = "get-fred-data";

// Cache TTL in milliseconds (varies by data type)
const CACHE_TTL = {
  DAILY: 1 * 60 * 60 * 1000,   // 1 hour
  WEEKLY: 6 * 60 * 60 * 1000,  // 6 hours
  MONTHLY: 24 * 60 * 60 * 1000 // 24 hours
};

// Categories of economic data
export const ECONOMIC_CATEGORIES = {
  INFLATION: "INFLATION",
  INTEREST_RATES: "INTEREST_RATES",
  ECONOMIC_GROWTH: "ECONOMIC_GROWTH",
  EMPLOYMENT: "EMPLOYMENT",
  MARKETS: "MARKETS"
};

// Interface for cache items
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Fetch with caching utility
async function fetchWithCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.DAILY,
  forceRefresh: boolean = false
): Promise<T> {
  try {
    // Check if data exists in cache and is still valid, unless forceRefresh is true
    const cachedItem = localStorage.getItem(cacheKey);
    
    if (cachedItem && !forceRefresh) {
      const parsedItem: CacheItem<T> = JSON.parse(cachedItem);
      const now = Date.now();
      
      // If cache is still valid, return the cached data
      if (now - parsedItem.timestamp < ttl) {
        console.log(`Using cached FRED data for ${cacheKey}`);
        return parsedItem.data;
      }
    }
    
    // If no valid cache exists or forceRefresh is true, fetch new data
    console.log(`Fetching fresh FRED data for ${cacheKey}`);
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

// Invoke the Supabase Edge Function to get FRED data
async function invokeFredFunction(params: any) {
  try {
    console.log("Invoking FRED function with params:", params);
    const { data, error } = await supabase.functions.invoke(SUPABASE_FRED_FUNCTION, {
      body: params
    });
    
    if (error) {
      console.error("FRED function error:", error);
      throw error;
    }
    
    console.log("FRED function response:", data);
    return data;
  } catch (error) {
    console.error("Error calling FRED API function:", error);
    throw error;
  }
}

// Get data for a specific economic category
export async function getEconomicCategory(category: string, forceRefresh: boolean = false) {
  console.log(`Getting data for category: ${category}, forceRefresh: ${forceRefresh}`);
  return fetchWithCache(
    `fred_${category.toLowerCase()}`,
    async () => invokeFredFunction({ category, forceRefresh }),
    getCategoryTTL(category),
    forceRefresh
  );
}

// Get data for a specific series
export async function getEconomicSeries(seriesId: string, forceRefresh: boolean = false) {
  console.log(`Getting data for series: ${seriesId}, forceRefresh: ${forceRefresh}`);
  return fetchWithCache(
    `fred_series_${seriesId}`,
    async () => invokeFredFunction({ seriesId, forceRefresh }),
    getSeriesTTL(seriesId),
    forceRefresh
  );
}

// Determine cache TTL based on category
function getCategoryTTL(category: string): number {
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

// Determine cache TTL based on series ID
function getSeriesTTL(seriesId: string): number {
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

// Clear all FRED cache data
export function clearFredCacheData() {
  let count = 0;
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("fred_")) {
      localStorage.removeItem(key);
      count++;
    }
  });
  console.log(`Cleared ${count} FRED data cache items`);
  toast.success("FRED data cache cleared, refreshing data");
}

// Get cache timestamp for a specific key
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

export default {
  getEconomicCategory,
  getEconomicSeries,
  clearFredCacheData,
  getFredCacheTimestamp,
  ECONOMIC_CATEGORIES
};

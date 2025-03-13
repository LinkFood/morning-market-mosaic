
import { ECONOMIC_CATEGORIES } from "./constants";
import { getEconomicCategory, getEconomicSeries } from "./dataService";
import { clearFredCacheData, getFredCacheTimestamp, getFredCacheStats } from "./cacheUtils";
import { invokeFredFunction } from "./apiClient";

/**
 * Test FRED API connection 
 * @returns Promise with test data or false if connection fails
 */
export async function testFredConnection(): Promise<boolean> {
  try {
    console.log("Testing FRED API connection...");
    // Test with a simple query
    const data = await getEconomicCategory(ECONOMIC_CATEGORIES.INFLATION, 1);
    return !!data;
  } catch (error) {
    console.error("FRED API connection test failed:", error);
    return false;
  }
}

// Export a unified API for the FRED service
export {
  getEconomicCategory,
  getEconomicSeries,
  clearFredCacheData,
  getFredCacheTimestamp,
  getFredCacheStats,
  ECONOMIC_CATEGORIES
};

// Default export with all methods
export default {
  getEconomicCategory,
  getEconomicSeries,
  clearFredCacheData,
  getFredCacheTimestamp,
  getFredCacheStats,
  testFredConnection,
  ECONOMIC_CATEGORIES
};

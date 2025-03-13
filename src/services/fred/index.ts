
import { ECONOMIC_CATEGORIES } from "./constants";
import { getEconomicCategory, getEconomicSeries } from "./dataService";
import { clearFredCacheData, getFredCacheTimestamp, getFredCacheStats } from "./cacheUtils";
import { testFredConnection } from "./apiClient";

// Export a unified API for the FRED service
export default {
  getEconomicCategory,
  getEconomicSeries,
  clearFredCacheData,
  getFredCacheTimestamp,
  getFredCacheStats,
  testFredConnection,
  ECONOMIC_CATEGORIES
};


import { ECONOMIC_CATEGORIES } from "./constants";
import { getEconomicCategory, getEconomicSeries } from "./dataService";
import { clearFredCacheData, getFredCacheTimestamp } from "./cacheUtils";
import { testFredConnection } from "./apiClient";

// Export a unified API for the FRED service
export default {
  getEconomicCategory,
  getEconomicSeries,
  clearFredCacheData,
  getFredCacheTimestamp,
  testFredConnection,
  ECONOMIC_CATEGORIES
};

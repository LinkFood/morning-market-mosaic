
/**
 * API Service
 * Main entry point for all API services
 */
import { toast } from "sonner";
import {
  MarketIndex,
  SectorPerformance,
  StockData,
  MarketStatus,
  MarketMovers,
  TickerDetails,
  CandleData,
  NewsItem,
  MarketEvent,
  EconomicIndicator
} from "@/types/marketTypes";
import { ScoredStock } from "@/services/stockPicker/algorithm";
import { StockAnalysis } from "@/services/stockPicker/aiAnalysis";

// Import specialized services
import marketService from "./market";
import stockPickerService from "./stockPicker";
// Import FRED service methods directly to avoid circular imports
import {
  getEconomicCategory,
  getEconomicSeries,
  clearFredCacheData,
  getFredCacheTimestamp,
  testFredConnection,
  ECONOMIC_CATEGORIES
} from "./fred";

// Re-export all services for backward compatibility
export const {
  getMarketIndices,
  getSectorPerformance,
  getMajorStocks,
  getStockSparkline,
  getMarketStatus,
  getMarketMovers,
  getStockDetails,
  getStockCandles,
  getMarketEvents
} = marketService;

// Re-export stock picker services
export const {
  getTopPicks,
  getStockAnalysis
} = stockPickerService;

// Get economic indicators from FRED
async function getEconomicIndicators(): Promise<EconomicIndicator[]> {
  try {
    // Get key economic indicators from FRED 
    // GDP, GDP Growth, Unemployment, Inflation (CPI)
    const keySeriesIds = ["GDPC1", "A191RL1Q225SBEA", "UNRATE", "CPIAUCSL"];
    const promises = keySeriesIds.map(seriesId => getEconomicSeries(seriesId));
    
    const results = await Promise.all(promises);
    
    // Convert to EconomicIndicator type
    const fedIndicators: EconomicIndicator[] = results.map(item => ({
      id: item.id,
      name: item.name,
      value: parseFloat(item.value),
      previous: parseFloat(item.previous),
      change: parseFloat(item.change),
      unit: item.unit,
      date: item.date
    }));
    
    return fedIndicators;
  } catch (error) {
    console.error("Error loading economic indicators:", error);
    toast.error("Failed to load economic indicators");
    return [];
  }
}

// Re-export cache utilities
export const {
  fetchWithCache,
  clearAllCacheData,
  getCacheTimestamp
} = marketService;

// Re-export FRED APIs
export {
  clearFredCacheData,
  getFredCacheTimestamp,
  getEconomicCategory,
  testFredConnection
};

// Default export with all methods
export default {
  // Market data APIs
  ...marketService,
  
  // Stock picker APIs
  ...stockPickerService,
  
  // Economic data APIs
  getEconomicIndicators,
  getEconomicCategory,
  clearFredCacheData,
  getFredCacheTimestamp,
  testFredConnection
};

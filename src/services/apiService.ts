
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

// Import specialized services
import marketService from "./market";
import fedApiService from "./fred";

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

// Get economic indicators from FRED
async function getEconomicIndicators(): Promise<EconomicIndicator[]> {
  try {
    // Get key economic indicators from FRED 
    // GDP, GDP Growth, Unemployment, Inflation (CPI)
    const keySeriesIds = ["GDPC1", "A191RL1Q225SBEA", "UNRATE", "CPIAUCSL"];
    const promises = keySeriesIds.map(seriesId => fedApiService.getEconomicSeries(seriesId));
    
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

// Default export with all methods
export default {
  // Market data APIs
  ...marketService,
  
  // Economic data APIs
  getEconomicIndicators,
};

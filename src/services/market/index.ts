
/**
 * Market Data Service
 * Main entry point for market data APIs
 */
import marketIndices from "./marketIndices";
import sectorPerformance from "./sectorPerformance";
import stocks from "./stocks";
import marketStatus from "./marketStatus";
import marketMovers from "./marketMovers";
import marketBreadth from "./marketBreadth";
import events from "./events";
import cacheUtils from "./cacheUtils";
import { realtime } from "../polygon/realtime";

// Export all services
export default {
  // Market data
  getMarketIndices: marketIndices.getMarketIndices,
  getSectorPerformance: sectorPerformance.getSectorPerformance,
  getMajorStocks: stocks.getMajorStocks,
  getStockSparkline: stocks.getStockSparkline,
  getMarketStatus: marketStatus.getMarketStatus,
  getMarketMovers: marketMovers.getMarketMovers,
  getMarketEvents: events.getMarketEvents,
  getMarketBreadth: marketBreadth.getMarketBreadth,
  
  // Stock details
  getStockDetails: stocks.getStockDetails,
  getStockCandles: stocks.getStockCandles,
  
  // Realtime updates
  realtime,
  
  // Cache utilities
  ...cacheUtils
};

// Export individual services for direct imports
export {
  marketIndices,
  sectorPerformance,
  stocks,
  marketStatus,
  marketMovers,
  marketBreadth,
  events,
  cacheUtils,
  realtime
};

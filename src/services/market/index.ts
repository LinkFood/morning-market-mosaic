
/**
 * Market Data Service
 * Main entry point for market data APIs
 */
import marketIndices from "./marketIndices";
import sectorPerformance from "./sectorPerformance";
import stocks from "./stocks";
import marketStatus from "./marketStatus";
import marketMovers from "./marketMovers";
import events from "./events";
import cacheUtils from "./cacheUtils";

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
  
  // Stock details
  getStockDetails: stocks.getStockDetails,
  getStockCandles: stocks.getStockCandles,
  
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
  events,
  cacheUtils
};

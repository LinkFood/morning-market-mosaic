
/**
 * Polygon.io API Service
 * Main entry point that exports all functionality
 */
import client from './client';
import marketData from './marketData';
import historical from './historical';
import referenceData from './reference';
import { realtime } from './realtime';
import { clearAllCache, getCacheTimestamp } from './cache';

// Integrate market data functions
const {
  getStockSnapshot,
  getBatchStockSnapshots,
  getMarketStatus,
  getMarketMovers
} = marketData;

// Integrate historical data functions
const {
  getStockCandles,
  getAggregates,
  getIndexData,
  getBatchIndexData
} = historical;

// Integrate reference data functions
const {
  getTickerDetails,
  getSectorPerformance,
  getMarketHolidays,
  getCompanyNews,
  getMarketBreadth
} = referenceData;

// Export all functions
export default {
  // Market data
  getStockSnapshot,
  getBatchStockSnapshots,
  getMarketStatus,
  getMarketMovers,
  
  // Historical data
  getStockCandles,
  getAggregates,
  getIndexData,
  getBatchIndexData,
  
  // Reference data
  getTickerDetails,
  getSectorPerformance,
  getMarketHolidays,
  getCompanyNews,
  getMarketBreadth,
  
  // Realtime updates
  realtime,
  
  // Cache management
  clearCache: clearAllCache,
  getCacheTimestamp
};

// Export for named imports
export {
  // Market data
  getStockSnapshot,
  getBatchStockSnapshots,
  getMarketStatus,
  getMarketMovers,
  
  // Historical data
  getStockCandles,
  getAggregates,
  getIndexData,
  getBatchIndexData,
  
  // Reference data
  getTickerDetails,
  getSectorPerformance,
  getMarketHolidays,
  getCompanyNews,
  getMarketBreadth,
  
  // Realtime updates
  realtime,
  
  // Cache management
  clearAllCache as clearCache,
  getCacheTimestamp
};


/**
 * Polygon.io API Service
 * Main entry point that exports all functionality
 */
import client from './client';
import { 
  getStockSnapshot, 
  getBatchStockSnapshots, 
  getMarketMovers 
} from './snapshots';
import { getMarketStatus } from './reference/marketStatus';
import {
  getStockCandles,
  getAggregates,
  getIndexData,
  getBatchIndexData
} from './historical';
import {
  getTickerDetails,
  getSectorPerformance,
  getMarketHolidays,
  getCompanyNews,
  getMarketBreadth
} from './reference';
import { realtime } from './realtime';
import { clearAllCache, getCacheTimestamp } from './cache';

// Import enhanced APIs
import enhancedAPI, {
  getStockFundamentals,
  getStockEarnings,
  getEnhancedMarketMovers,
  getOptionsData,
  getStockNews,
  getInsiderTransactions
} from './enhanced';

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
  getCacheTimestamp,
  
  // Enhanced APIs
  enhanced: enhancedAPI,
  getStockFundamentals,
  getStockEarnings,
  getEnhancedMarketMovers,
  getOptionsData,
  getStockNews,
  getInsiderTransactions
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
  getCacheTimestamp,
  
  // Enhanced APIs
  enhancedAPI as enhanced,
  getStockFundamentals,
  getStockEarnings,
  getEnhancedMarketMovers,
  getOptionsData,
  getStockNews,
  getInsiderTransactions
};

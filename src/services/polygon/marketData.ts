
/**
 * Polygon.io Market Data Service
 * Provides real-time and delayed market data
 * 
 * This is a compatibility layer for the refactored services.
 * New code should import specific functions from their respective modules.
 */
import { getStockSnapshot, getBatchStockSnapshots } from './snapshots/stockSnapshot';
import { getMarketMovers } from './snapshots/marketMovers';
import { getMarketStatus } from './reference/marketStatus';

// Re-export all functions
export {
  getStockSnapshot,
  getBatchStockSnapshots,
  getMarketStatus,
  getMarketMovers
};

// Default export with all functions
export default {
  getStockSnapshot,
  getBatchStockSnapshots,
  getMarketStatus,
  getMarketMovers
};

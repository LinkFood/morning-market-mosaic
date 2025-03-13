
/**
 * Polygon.io Snapshots Service
 * Main entry point for snapshot data APIs
 */
import { getStockSnapshot, getBatchStockSnapshots } from './stockSnapshot';
import { getMarketMovers } from './marketMovers';

// Export all functions directly
export {
  getStockSnapshot,
  getBatchStockSnapshots,
  getMarketMovers
};

// Default export with all functions
export default {
  getStockSnapshot,
  getBatchStockSnapshots,
  getMarketMovers
};

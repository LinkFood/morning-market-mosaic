
/**
 * Polygon.io Historical Data Service
 * Main entry point for historical data APIs
 */
import { getStockCandles } from './candles';
import { getAggregates } from './aggregates';
import { getIndexData, getBatchIndexData } from './indices';

// Export all functions directly
export {
  getStockCandles,
  getAggregates,
  getIndexData,
  getBatchIndexData
};

// Default export with all functions
export default {
  getStockCandles,
  getAggregates,
  getIndexData,
  getBatchIndexData
};

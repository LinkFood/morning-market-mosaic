
/**
 * Stock Picker Service
 * Main entry point for stock picking functionality
 */
import algorithm, { ScoredStock } from './algorithm';
import { StockData } from '@/types/marketTypes';
import { isFeatureEnabled } from '@/services/featureFlags';

/**
 * Get top stock picks based on algorithmic analysis
 * @param stocks Array of stock data to analyze
 * @returns Promise with top stock recommendations
 */
async function getTopPicks(stocks: StockData[]): Promise<ScoredStock[]> {
  // Check if algorithm feature is enabled
  if (!isFeatureEnabled('useStockPickerAlgorithm')) {
    console.log('Stock picker algorithm is disabled by feature flag');
    return [];
  }
  
  try {
    // Apply algorithm to evaluate stocks
    const recommendations = algorithm.evaluateStocks(stocks);
    return recommendations;
  } catch (error) {
    console.error('Error in stock picker algorithm:', error);
    return [];
  }
}

export default {
  getTopPicks
};

// Use 'export type' for re-exporting types when isolatedModules is enabled
export { getTopPicks };
export type { ScoredStock };

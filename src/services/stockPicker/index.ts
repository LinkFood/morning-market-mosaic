
/**
 * Stock Picker Service
 * Main entry point for stock picking functionality
 */
import algorithm, { ScoredStock } from './algorithm';
import aiAnalysis, { StockAnalysis } from './aiAnalysis';
import { StockData } from '@/types/marketTypes';
import { isFeatureEnabled } from '@/services/features'; // Fixed import path

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
    
    // Log the recommendations for debugging
    console.log(`Stock picker generated ${recommendations.length} recommendations`);
    if (recommendations.length > 0) {
      console.log('Top pick:', recommendations[0].ticker, 'with score:', recommendations[0].scores.composite);
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error in stock picker algorithm:', error);
    return [];
  }
}

/**
 * Get AI-enhanced analysis for stock picks
 * @param stocks Array of scored stocks to analyze
 * @returns Promise with AI analysis results
 */
async function getStockAnalysis(stocks: ScoredStock[]): Promise<StockAnalysis> {
  // Check if AI analysis feature is enabled
  if (!isFeatureEnabled('useAIStockAnalysis')) {
    console.log('AI stock analysis is disabled by feature flag');
    return {
      stockAnalyses: {},
      marketInsight: "AI analysis is currently disabled.",
      generatedAt: new Date().toISOString()
    };
  }
  
  try {
    console.log(`Requesting AI analysis for ${stocks.length} stocks`);
    const result = await aiAnalysis.getAIAnalysis(stocks);
    
    // Log the result for debugging
    console.log('AI analysis received with market insight:', 
      result.marketInsight ? result.marketInsight.substring(0, 50) + '...' : 'None');
    console.log('AI analysis received for stocks:', Object.keys(result.stockAnalyses).join(', '));
    
    return result;
  } catch (error) {
    console.error('Error in AI stock analysis:', error);
    return {
      stockAnalyses: {},
      marketInsight: "An error occurred during AI analysis.",
      generatedAt: new Date().toISOString()
    };
  }
}

export default {
  getTopPicks,
  getStockAnalysis
};

// Use 'export type' for re-exporting types when isolatedModules is enabled
export { getTopPicks, getStockAnalysis };
export type { ScoredStock };
export type { StockAnalysis };

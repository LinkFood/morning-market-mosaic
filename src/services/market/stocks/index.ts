
/**
 * Stock market data service
 * Provides data for individual stocks
 */
import stockData from "./stockData";
import stockDetails from "./stockDetails";
import stockCharts from "./stockCharts";
import stockAnalytics from "./stockAnalytics";

// Re-export all functions for backward compatibility
export default {
  // Basic stock data
  getMajorStocks: stockData.getMajorStocks,
  getStockSparkline: stockData.getStockSparkline,
  
  // Stock details
  getStockDetails: stockDetails.getStockDetails,
  
  // Chart data
  getStockCandles: stockCharts.getStockCandles,
  
  // Analytics
  get52WeekHighLow: stockAnalytics.get52WeekHighLow
};

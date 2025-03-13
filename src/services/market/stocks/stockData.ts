
/**
 * Stock Data Service
 * Basic stock data functionality
 */
import { StockData } from "@/types/marketTypes";
import cacheUtils from "../cacheUtils";
import mockData from "../mockData";
import { getPolygonApiKey } from "../config";
import polygonService from "../../polygon";

// Get major stocks data
async function getMajorStocks(tickers: string[] = ["AAPL", "MSFT", "AMZN", "GOOGL", "META"]): Promise<StockData[]> {
  return cacheUtils.fetchWithCache(`market_stocks_${tickers.join("_")}`, async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for major stocks, returning mock data");
        return mockData.MOCK_STOCKS_DATA;
      }
      
      // Get batch stock snapshots
      const stockData = await polygonService.getBatchStockSnapshots(tickers);
      
      // Add names to stock data if missing
      return stockData.map(stock => ({
        ...stock,
        name: stock.name || stock.ticker // Ensure name is populated
      }));
    } catch (error) {
      console.error("Error fetching major stocks:", error);
      return mockData.MOCK_STOCKS_DATA; // Fallback to mock data
    }
  });
}

// Get stock sparkline data (7 day history)
async function getStockSparkline(ticker: string): Promise<number[]> {
  return cacheUtils.fetchWithCache(`market_sparkline_${ticker}`, async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for sparkline data, returning mock data");
        // Return mock sparkline data
        const trend = Math.random() > 0.5; // Random up or down trend
        return mockData.generateMockSparkline(trend);
      }
      
      // Get end date (today) and start date (7 days ago)
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      
      const fromDate = weekAgo.toISOString().split('T')[0];
      const toDate = now.toISOString().split('T')[0];
      
      // Get candle data for the ticker
      const candles = await polygonService.getAggregates(
        ticker,
        1,
        "day",
        fromDate,
        toDate
      );
      
      // Extract close prices
      return candles.map(candle => candle.close);
    } catch (error) {
      console.error(`Error fetching sparkline for ${ticker}:`, error);
      // Generate mock sparkline data as fallback
      const trend = Math.random() > 0.5;
      return mockData.generateMockSparkline(trend);
    }
  });
}

export default {
  getMajorStocks,
  getStockSparkline
};

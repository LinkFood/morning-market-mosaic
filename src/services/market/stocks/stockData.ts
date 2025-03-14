
/**
 * Stock Data Service
 * Basic stock data functionality
 */
import { StockData } from "@/types/marketTypes";
import cacheUtils from "../cacheUtils";
import mockData from "../mockData";
import { getPolygonApiKey } from "../config";
import { polygonRequest } from "../../polygon/client";

// Cache management variables
const CACHE_COOLDOWN = 30000; // 30 seconds between API calls
let lastApiCallTimestamp = 0;
let apiCallInProgress = false;
let pendingStockPromise: Promise<StockData[]> | null = null;

// Get major stocks data
async function getMajorStocks(tickers: string[] = ["AAPL", "MSFT", "AMZN", "GOOGL", "META"]): Promise<StockData[]> {
  // Sort tickers for consistent cache key
  const sortedTickers = [...tickers].sort();
  const cacheKey = `market_stocks_${sortedTickers.join("_")}`;
  
  // Check if we have cached data first
  const cachedData = await cacheUtils.fetchWithCache(cacheKey, null, true);
  if (cachedData) {
    console.log("Using cached major stocks data");
    return cachedData;
  }
  
  // If another API call is in progress, return the pending promise
  if (apiCallInProgress && pendingStockPromise) {
    console.log("Another stocks API call in progress, reusing promise");
    return pendingStockPromise;
  }
  
  // Check if we need to respect cooldown
  const now = Date.now();
  if (now - lastApiCallTimestamp < CACHE_COOLDOWN) {
    console.log("API call cooldown in effect, using mock data");
    return mockData.MOCK_STOCKS_DATA.filter(stock => 
      tickers.includes(stock.ticker)
    ).map(stock => ({
      ...stock,
      name: stock.name || stock.ticker
    }));
  }
  
  // Start API call
  apiCallInProgress = true;
  lastApiCallTimestamp = now;
  
  // Create and store the promise
  pendingStockPromise = (async () => {
    try {
      // Get API key from Supabase
      const apiKey = await getPolygonApiKey();
      
      if (apiKey === "DEMO_API_KEY") {
        console.log("Using demo API key for major stocks, returning mock data");
        return mockData.MOCK_STOCKS_DATA.filter(stock => 
          tickers.includes(stock.ticker)
        );
      }
      
      // Get batch stock snapshots with retries
      console.log("Fetching stock data for", tickers.length, "stocks");
      const stockData = await polygonRequest(
        `/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickers.join(',')}`
      ).then(response => {
        // Map response data to StockData format
        if (!response.tickers || !Array.isArray(response.tickers)) {
          console.warn("No tickers data in API response, returning empty array");
          return [] as StockData[]; // Ensure we return an empty array, not an object
        }
        
        return (response.tickers || []).map((item: any) => ({
          ticker: item.ticker,
          name: item.name || item.ticker,
          close: item.day?.c || 0,
          open: item.day?.o || 0,
          high: item.day?.h || 0,
          low: item.day?.l || 0,
          change: item.todaysChange || 0,
          changePercent: item.todaysChangePerc || 0,
          volume: item.day?.v || 0
        }));
      });
      
      // Fill in missing stocks with mock data
      const receivedTickers = stockData.map(s => s.ticker);
      const missingTickers = tickers.filter(t => !receivedTickers.includes(t));
      
      if (missingTickers.length > 0) {
        console.log("Missing data for tickers:", missingTickers);
        const mockStocksForMissing = mockData.MOCK_STOCKS_DATA
          .filter(stock => missingTickers.includes(stock.ticker))
          .map(stock => ({
            ...stock,
            name: stock.name || stock.ticker
          }));
        
        stockData.push(...mockStocksForMissing);
      }
      
      // Cache the result
      cacheUtils.cacheData(cacheKey, stockData);
      
      return stockData;
    } catch (error) {
      console.error("Error fetching major stocks:", error);
      
      // Return filtered mock data as fallback
      return mockData.MOCK_STOCKS_DATA.filter(stock => 
        tickers.includes(stock.ticker)
      ).map(stock => ({
        ...stock,
        name: stock.name || stock.ticker
      }));
    } finally {
      apiCallInProgress = false;
      pendingStockPromise = null;
    }
  })();
  
  return pendingStockPromise;
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
      
      // Get candle data for the ticker with retry
      const candles = await polygonRequest(
        `/v2/aggs/ticker/${ticker}/range/1/day/${fromDate}/${toDate}`
      ).then(response => {
        if (response.results && Array.isArray(response.results)) {
          return response.results.map((candle: any) => ({
            open: candle.o,
            high: candle.h,
            low: candle.l,
            close: candle.c,
            volume: candle.v,
            timestamp: candle.t
          }));
        }
        throw new Error("Invalid response format for candles");
      });
      
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

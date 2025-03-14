
/**
 * Polygon.io Stock Snapshot Service
 * Provides real-time stock snapshot data
 */
import { polygonRequest } from '../client';
import { getCachedData, cacheData, CACHE_TTL } from '../cache';
import { StockData } from '@/types/marketTypes';

/**
 * Get current snapshot data for a single stock
 * @param ticker Stock ticker symbol
 * @returns Promise with stock snapshot data
 */
export async function getStockSnapshot(ticker: string): Promise<StockData> {
  const cacheKey = `snapshot_${ticker}`;
  const cachedData = getCachedData(cacheKey, CACHE_TTL.STOCK_SNAPSHOT);
  
  if (cachedData) {
    return cachedData as StockData;
  }
  
  try {
    const response = await polygonRequest(`/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`);
    
    // Transform the response into our StockData format
    const stockData: StockData = {
      ticker: response.ticker.ticker,
      close: response.ticker.day.c,
      open: response.ticker.day.o,
      high: response.ticker.day.h,
      low: response.ticker.day.l,
      change: response.ticker.todaysChange,
      changePercent: response.ticker.todaysChangePerc,
    };
    
    // Cache the result
    cacheData(cacheKey, stockData);
    
    return stockData;
  } catch (error) {
    console.error(`Error fetching snapshot for ${ticker}:`, error);
    throw error;
  }
}

/**
 * Get snapshot data for multiple stocks in a single API call
 * @param tickers Array of ticker symbols
 * @param limit Optional limit for number of results (for movers)
 * @param type Optional type ('gainers' or 'losers' for market movers)
 * @returns Promise with array of stock data
 */
export async function getBatchStockSnapshots(
  tickers: string[] = [], 
  limit: number = 10,
  type?: 'gainers' | 'losers'
): Promise<StockData[]> {
  // For gainers/losers, use separate endpoint
  if (type) {
    const cacheKey = `market_${type}_${limit}`;
    const cachedData = getCachedData(cacheKey, CACHE_TTL.MARKET_MOVERS);
    
    if (cachedData) {
      return cachedData as StockData[];
    }
    
    try {
      // Use movers endpoint
      const response = await polygonRequest(`/v2/snapshot/locale/us/markets/stocks/${type}?limit=${limit}`);
      
      // Transform the response data
      const stocksData: StockData[] = response.tickers.map((item: any) => {
        const stockData: StockData = {
          ticker: item.ticker,
          name: item.ticker, // Default name to ticker if not available
          close: item.day.c,
          open: item.day.o,
          high: item.day.h,
          low: item.day.l,
          change: item.todaysChange,
          changePercent: item.todaysChangePerc,
          volume: item.day?.v || 0, // Include volume
        };
        
        // Cache individual stock data
        cacheData(`snapshot_${item.ticker}`, stockData);
        
        return stockData;
      });
      
      // Cache the entire result
      cacheData(cacheKey, stocksData);
      
      return stocksData;
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      // Return empty array with proper type instead of {}
      return [] as StockData[];
    }
  }
  
  // Otherwise, continue with standard batch snapshot logic
  // Check if we have all tickers in cache
  const cachedResults: StockData[] = [];
  const tickersToFetch: string[] = [];
  
  // Check each ticker in the cache
  tickers.forEach(ticker => {
    const cacheKey = `snapshot_${ticker}`;
    const cachedData = getCachedData(cacheKey, CACHE_TTL.STOCK_SNAPSHOT);
    
    if (cachedData) {
      cachedResults.push(cachedData as StockData);
    } else {
      tickersToFetch.push(ticker);
    }
  });
  
  // If all tickers were in cache, return them
  if (tickersToFetch.length === 0 && cachedResults.length > 0) {
    return cachedResults;
  }
  
  try {
    // Format tickers for the API request
    const tickersParam = tickersToFetch.join(',');
    
    const response = await polygonRequest(`/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickersParam}`);
    
    // Transform the response data
    const stocksData: StockData[] = response.tickers.map((item: any) => {
      const stockData: StockData = {
        ticker: item.ticker,
        name: item.ticker, // Default name to ticker if not available
        close: item.day.c,
        open: item.day.o,
        high: item.day.h,
        low: item.day.l,
        change: item.todaysChange,
        changePercent: item.todaysChangePerc,
        volume: item.day?.v || 0, // Include volume
      };
      
      // Cache individual stock data
      cacheData(`snapshot_${item.ticker}`, stockData);
      
      return stockData;
    });
    
    // Combine cached results with fresh data
    return [...cachedResults, ...stocksData];
  } catch (error) {
    console.error(`Error fetching batch snapshots:`, error);
    
    // If we have some cached results, return those instead of failing
    if (cachedResults.length > 0) {
      console.log(`Returning ${cachedResults.length} cached results due to API error`);
      return cachedResults;
    }
    
    // Return empty array with proper type instead of throwing
    return [] as StockData[];
  }
}

export default {
  getStockSnapshot,
  getBatchStockSnapshots
};

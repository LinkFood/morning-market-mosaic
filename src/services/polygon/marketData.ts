/**
 * Polygon.io Market Data Service
 * Provides real-time and delayed market data
 */
import { polygonRequest } from './client';
import { 
  getCachedData, 
  cacheData, 
  CACHE_TTL 
} from './cache';
import { MarketIndex, StockData } from '@/types/marketTypes';

/**
 * Get current snapshot data for a single stock
 * @param ticker Stock ticker symbol
 * @returns Promise with stock snapshot data
 */
export async function getStockSnapshot(ticker: string): Promise<StockData> {
  const cacheKey = `snapshot_${ticker}`;
  const cachedData = getCachedData<StockData>(cacheKey, CACHE_TTL.STOCK_SNAPSHOT);
  
  if (cachedData) {
    return cachedData;
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
    const cachedData = getCachedData<StockData[]>(cacheKey, CACHE_TTL.MARKET_MOVERS);
    
    if (cachedData) {
      return cachedData;
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
      throw error;
    }
  }
  
  // Otherwise, continue with standard batch snapshot logic
  // Check if we have all tickers in cache
  const cachedResults: StockData[] = [];
  const tickersToFetch: string[] = [];
  
  // Check each ticker in the cache
  tickers.forEach(ticker => {
    const cacheKey = `snapshot_${ticker}`;
    const cachedData = getCachedData<StockData>(cacheKey, CACHE_TTL.STOCK_SNAPSHOT);
    
    if (cachedData) {
      cachedResults.push(cachedData);
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
    
    throw error;
  }
}

/**
 * Get current market status (open/closed)
 * @returns Promise with market status information
 */
export async function getMarketStatus() {
  const cacheKey = 'market_status';
  const cachedData = getCachedData(cacheKey, CACHE_TTL.MARKET_STATUS);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await polygonRequest('/v1/marketstatus/now');
    
    // Format the response
    const marketStatus = {
      market: response.market,
      serverTime: response.serverTime,
      exchanges: response.exchanges,
      isOpen: response.market === 'open',
      nextOpeningTime: null as string | null,
    };
    
    // If market is closed, get the next opening time
    if (!marketStatus.isOpen) {
      try {
        const calendarResponse = await polygonRequest('/v1/calendar/trading/next');
        marketStatus.nextOpeningTime = calendarResponse.open;
      } catch (e) {
        console.error("Error fetching next trading day:", e);
      }
    }
    
    // Cache the result
    cacheData(cacheKey, marketStatus);
    
    return marketStatus;
  } catch (error) {
    console.error("Error fetching market status:", error);
    throw error;
  }
}

/**
 * Get top market movers (gainers and losers)
 * @param limit Number of stocks to return in each category (default: 5)
 * @returns Promise with top gainers and losers
 */
export async function getMarketMovers(limit: number = 5) {
  const cacheKey = `market_movers_${limit}`;
  const cachedData = getCachedData(cacheKey, CACHE_TTL.MARKET_MOVERS);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Get top gainers
    const gainersResponse = await polygonRequest(`/v2/snapshot/locale/us/markets/stocks/gainers?limit=${limit}`);
    
    // Get top losers
    const losersResponse = await polygonRequest(`/v2/snapshot/locale/us/markets/stocks/losers?limit=${limit}`);
    
    // Format the responses
    const gainers: StockData[] = gainersResponse.tickers.map((item: any) => ({
      ticker: item.ticker,
      close: item.day.c,
      open: item.day.o,
      high: item.day.h,
      low: item.day.l,
      change: item.todaysChange,
      changePercent: item.todaysChangePerc,
    }));
    
    const losers: StockData[] = losersResponse.tickers.map((item: any) => ({
      ticker: item.ticker,
      close: item.day.c,
      open: item.day.o,
      high: item.day.h,
      low: item.day.l,
      change: item.todaysChange,
      changePercent: item.todaysChangePerc,
    }));
    
    const result = { gainers, losers };
    
    // Cache the result
    cacheData(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error("Error fetching market movers:", error);
    throw error;
  }
}

export default {
  getStockSnapshot,
  getBatchStockSnapshots,
  getMarketStatus,
  getMarketMovers
};

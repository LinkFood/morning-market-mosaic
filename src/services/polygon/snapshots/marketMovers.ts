
/**
 * Polygon.io Market Movers Service
 * Provides data on top gainers and losers
 */
import client from '../client';
import { getCachedData, cacheData, CACHE_TTL } from '../cache';
import { StockData } from '@/types/marketTypes';

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
    const gainersResponse = await client.get(`/v2/snapshot/locale/us/markets/stocks/gainers?limit=${limit}`);
    
    // Get top losers
    const losersResponse = await client.get(`/v2/snapshot/locale/us/markets/stocks/losers?limit=${limit}`);
    
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
  getMarketMovers
};

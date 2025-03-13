
/**
 * Polygon.io Historical Index Data
 * Provides data for market indices
 */
import { polygonRequest } from '../client';
import { getCachedData, cacheData, CACHE_TTL } from '../cache';
import { MarketIndex } from '@/types/marketTypes';

/**
 * Get historical data for a market index
 * @param indexTicker Index ticker symbol
 * @returns Promise with index data
 */
export async function getIndexData(indexTicker: string): Promise<MarketIndex> {
  const cacheKey = `index_${indexTicker}`;
  const cachedData = getCachedData<MarketIndex>(cacheKey, CACHE_TTL.INDEX_DATA);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await polygonRequest(`/v2/snapshot/locale/us/markets/indices/tickers/${indexTicker}`);
    
    // Format the response
    const indexData: MarketIndex = {
      ticker: response.ticker.ticker,
      name: response.ticker.name || response.ticker.ticker,
      close: response.ticker.day.c,
      open: response.ticker.day.o,
      high: response.ticker.day.h,
      low: response.ticker.day.l,
      change: response.ticker.todaysChange,
      changePercent: response.ticker.todaysChangePerc,
      volume: response.ticker.day.v,
    };
    
    // Cache the result
    cacheData(cacheKey, indexData);
    
    return indexData;
  } catch (error) {
    console.error(`Error fetching index data for ${indexTicker}:`, error);
    throw error;
  }
}

/**
 * Get historical data for multiple market indices
 * @param indexTickers Array of index tickers
 * @returns Promise with array of index data
 */
export async function getBatchIndexData(indexTickers: string[]): Promise<MarketIndex[]> {
  // Check cache first
  const cachedResults: MarketIndex[] = [];
  const tickersToFetch: string[] = [];
  
  // Check each ticker in the cache
  indexTickers.forEach(ticker => {
    const cacheKey = `index_${ticker}`;
    const cachedData = getCachedData<MarketIndex>(cacheKey, CACHE_TTL.INDEX_DATA);
    
    if (cachedData) {
      cachedResults.push(cachedData);
    } else {
      tickersToFetch.push(ticker);
    }
  });
  
  // If all tickers were in cache, return them
  if (tickersToFetch.length === 0) {
    return cachedResults;
  }
  
  try {
    // Format tickers for the API request
    const tickersParam = tickersToFetch.join(',');
    
    const response = await polygonRequest(`/v2/snapshot/locale/us/markets/indices/tickers?tickers=${tickersParam}`);
    
    // Format the response
    const indicesData: MarketIndex[] = response.tickers.map((item: any) => {
      const indexData: MarketIndex = {
        ticker: item.ticker,
        name: item.name || item.ticker,
        close: item.day.c,
        open: item.day.o,
        high: item.day.h,
        low: item.day.l,
        change: item.todaysChange,
        changePercent: item.todaysChangePerc,
        volume: item.day.v,
      };
      
      // Cache individual index data
      cacheData(`index_${item.ticker}`, indexData);
      
      return indexData;
    });
    
    // Combine cached and fresh results
    return [...cachedResults, ...indicesData];
  } catch (error) {
    console.error(`Error fetching batch index data:`, error);
    
    // If we have some cached results, return those instead of failing
    if (cachedResults.length > 0) {
      console.log(`Returning ${cachedResults.length} cached results due to API error`);
      return cachedResults;
    }
    
    throw error;
  }
}

export default {
  getIndexData,
  getBatchIndexData
};

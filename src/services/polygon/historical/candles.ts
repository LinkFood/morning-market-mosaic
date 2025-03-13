
/**
 * Polygon.io Historical Candle Data
 * Provides time series OHLCV data for stocks
 */
import { polygonRequest } from '../client';
import { getCachedData, cacheData, CACHE_TTL } from '../cache';

/**
 * Get OHLCV candle data for a stock
 * @param ticker Stock ticker symbol
 * @param timespan The timespan to get data for (day, hour, minute, etc.)
 * @param from Start date (YYYY-MM-DD)
 * @param to End date (YYYY-MM-DD)
 * @returns Promise with candle data
 */
export async function getStockCandles(
  ticker: string, 
  timespan: string = 'day', 
  from: string, 
  to: string
) {
  const cacheKey = `candles_${ticker}_${timespan}_${from}_${to}`;
  const cachedData = getCachedData(cacheKey, CACHE_TTL.INDEX_DATA);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await polygonRequest(
      `/v2/aggs/ticker/${ticker}/range/1/${timespan}/${from}/${to}`
    );
    
    // Transform the response to a more useful format
    const formattedData = response.results.map((item: any) => ({
      date: new Date(item.t).toISOString().split('T')[0],
      timestamp: item.t,
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v,
    }));
    
    // Cache the result
    cacheData(cacheKey, formattedData);
    
    return formattedData;
  } catch (error) {
    console.error(`Error fetching candles for ${ticker}:`, error);
    throw error;
  }
}

export default {
  getStockCandles
};

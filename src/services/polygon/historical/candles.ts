
/**
 * Polygon.io Historical Candle Data
 * Provides time series OHLCV data for stocks
 */
import { makeApiCall } from '../api-client';
import { getCachedData, cacheData, CACHE_TTL } from '../cache';
import { CandleData } from '@/types/marketTypes';

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
): Promise<CandleData[]> {
  const cacheKey = `candles_${ticker}_${timespan}_${from}_${to}`;
  const cachedData = getCachedData(cacheKey, CACHE_TTL.INDEX_DATA);
  
  if (cachedData) {
    console.log(`Using cached candle data for ${ticker}`);
    return cachedData as CandleData[];
  }
  
  try {
    console.log(`Fetching candle data for ${ticker} (${timespan}) from ${from} to ${to}`);
    
    // Request candles from Polygon API
    const endpoint = `/v2/aggs/ticker/${ticker}/range/1/${timespan}/${from}/${to}`;
    const response = await makeApiCall(endpoint);
    
    // Validate response
    if (!response.results || !Array.isArray(response.results)) {
      console.warn(`Invalid response from Polygon for ${ticker} candles:`, response);
      return [] as CandleData[]; // Return empty array with correct type
    }
    
    // Transform the response to the CandleData format
    const formattedData: CandleData[] = response.results.map((item: any) => ({
      date: new Date(item.t).toISOString().split('T')[0],
      timestamp: item.t,
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v,
      vwap: item.vw || null
    }));
    
    // Cache the result
    cacheData(cacheKey, formattedData, CACHE_TTL.INDEX_DATA);
    
    console.log(`Successfully fetched ${formattedData.length} candles for ${ticker}`);
    return formattedData;
  } catch (error) {
    console.error(`Error fetching candles for ${ticker}:`, error);
    return [] as CandleData[]; // Return empty array with the correct type
  }
}

export default {
  getStockCandles
};

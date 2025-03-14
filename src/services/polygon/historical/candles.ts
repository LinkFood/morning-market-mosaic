
/**
 * Polygon.io Historical Stock Candles
 * Provides historical candle (OHLC) data for stocks
 */
import client from '../client';
import { getCachedData, cacheData } from '../cache';
import { CandleData } from '@/types/marketTypes';

// Cache time-to-live in seconds
const CACHE_TTL = {
  INTRADAY: 60 * 5, // 5 minutes
  DAILY: 60 * 60 * 4, // 4 hours
  WEEKLY: 60 * 60 * 24, // 1 day
  MONTHLY: 60 * 60 * 24 * 7 // 1 week
};

/**
 * Get stock candles (OHLC) data
 * @param ticker Stock ticker symbol
 * @param timespan Time interval (minute, hour, day, week, month, etc.)
 * @param from Start date (YYYY-MM-DD)
 * @param to End date (YYYY-MM-DD)
 */
export async function getStockCandles(
  ticker: string,
  timespan: string = 'day',
  from: string,
  to: string
): Promise<CandleData[]> {
  // Determine appropriate multiplier and timespan format
  const { multiplier, timespanFormat } = getTimespanParams(timespan);
  
  // Generate cache key
  const cacheKey = `candles_${ticker}_${multiplier}_${timespanFormat}_${from}_${to}`;
  
  // Determine cache TTL based on timespan
  let cacheTTL = CACHE_TTL.DAILY;
  if (timespanFormat === 'minute') cacheTTL = CACHE_TTL.INTRADAY;
  if (timespanFormat === 'week') cacheTTL = CACHE_TTL.WEEKLY;
  if (timespanFormat === 'month') cacheTTL = CACHE_TTL.MONTHLY;
  
  // Check cache first
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    console.log(`Using cached candle data for ${ticker} (${timespan})`);
    return cachedData as CandleData[];
  }
  
  try {
    // Make the request to Polygon API
    const endpoint = `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespanFormat}/${from}/${to}`;
    console.log(`Requesting candle data from Polygon: ${endpoint}`);
    
    const response = await client.get(endpoint, {
      adjusted: 'true',
      sort: 'asc',
      limit: '5000'
    });
    
    // Validate response
    if (!response.results || !Array.isArray(response.results)) {
      console.warn(`Invalid response for ${ticker} candles:`, response);
      return [];
    }
    
    // Transform the data into our format
    const candleData: CandleData[] = response.results.map(item => ({
      timestamp: item.t,
      date: new Date(item.t).toISOString(),
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v,
      vwap: item.vw || null
    }));
    
    // Cache the results
    cacheData(cacheKey, candleData, cacheTTL);
    
    console.log(`Successfully retrieved ${candleData.length} candles for ${ticker}`);
    return candleData;
  } catch (error) {
    console.error(`Error fetching candle data for ${ticker}:`, error);
    return [];
  }
}

/**
 * Map timespan string to Polygon parameters
 */
function getTimespanParams(timespan: string): { multiplier: number; timespanFormat: string } {
  switch (timespan) {
    case 'minute':
    case '1min':
      return { multiplier: 1, timespanFormat: 'minute' };
    case '5min':
      return { multiplier: 5, timespanFormat: 'minute' };
    case '15min':
      return { multiplier: 15, timespanFormat: 'minute' };
    case '30min':
      return { multiplier: 30, timespanFormat: 'minute' };
    case 'hour':
    case '1hour':
      return { multiplier: 1, timespanFormat: 'hour' };
    case 'day':
    case '1D':
      return { multiplier: 1, timespanFormat: 'day' };
    case 'week':
    case '1W':
      return { multiplier: 1, timespanFormat: 'week' };
    case 'month':
    case '1M':
      return { multiplier: 1, timespanFormat: 'month' };
    default:
      return { multiplier: 1, timespanFormat: 'day' };
  }
}

export default {
  getStockCandles
};

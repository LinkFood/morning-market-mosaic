
/**
 * Polygon.io Historical Data Service
 * Provides access to historical price data for stocks, indices, and more
 */
import client from './client';
import { addToCache, getFromCache } from './cache';
import { CandleData } from '@/types/marketTypes';

/**
 * Get aggregated (candle) data for a stock
 */
export async function getAggregates(
  ticker: string,
  multiplier: number,
  timespan: string,
  from: string,
  to: string,
  adjusted: boolean = true,
  limit: number = 5000,
  includeOtc: boolean = false
): Promise<CandleData[]> {
  // Cache key based on parameters
  const cacheKey = `aggregates_${ticker}_${multiplier}_${timespan}_${from}_${to}_${adjusted}_${includeOtc}`;
  
  // Check cache first
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    console.log(`Using cached data for ${ticker} ${timespan}`);
    return cachedData;
  }
  
  try {
    // Request from API
    const response = await client.get(`/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`, {
      adjusted: adjusted.toString(),
      sort: 'asc',
      limit: limit.toString(),
      ...(includeOtc && { include_otc: 'true' })
    });
    
    // Check if results field exists and is an array
    if (!response || !response.results || !Array.isArray(response.results)) {
      console.warn(`Invalid response from Polygon for ${ticker} aggregates:`, response);
      return [];
    }
    
    // Log successful receipt
    console.log(`Polygon API returned ${response.results.length} results for ${ticker}`);
    
    // Transform data to standard format
    const candles: CandleData[] = response.results.map((candle: any) => ({
      date: new Date(candle.t).toISOString(),
      timestamp: candle.t,
      open: candle.o,
      high: candle.h,
      low: candle.l,
      close: candle.c,
      volume: candle.v,
      vwap: candle.vw,
      transactions: candle.n
    }));
    
    // Cache results
    addToCache(cacheKey, candles, 60 * 5); // Cache for 5 minutes
    
    return candles;
  } catch (error) {
    console.error(`Error fetching aggregates for ${ticker}:`, error);
    throw error; // Let the caller handle this
  }
}

/**
 * Get historical stock candles for charting
 */
export async function getStockCandles(
  ticker: string,
  timeframe: string = 'day',
  fromDate: string,
  toDate: string
): Promise<CandleData[]> {
  // Map timeframe to Polygon parameters
  const { multiplier, timespan } = mapTimeframeToParams(timeframe);
  
  // Get aggregates data
  return getAggregates(ticker, multiplier, timespan, fromDate, toDate);
}

/**
 * Get historical index data
 */
export async function getIndexData(
  indexTicker: string,
  timeframe: string = 'day',
  fromDate: string,
  toDate: string
): Promise<CandleData[]> {
  // Map timeframe to Polygon parameters
  const { multiplier, timespan } = mapTimeframeToParams(timeframe);
  
  // Index tickers need to be prefixed with I: for Polygon
  const formattedTicker = indexTicker.startsWith('I:') ? indexTicker : `I:${indexTicker}`;
  
  // Get aggregates data
  return getAggregates(formattedTicker, multiplier, timespan, fromDate, toDate);
}

/**
 * Get batch index data for multiple indices
 */
export async function getBatchIndexData(
  indexTickers: string[],
  timeframe: string = 'day',
  fromDate: string,
  toDate: string
): Promise<Record<string, CandleData[]>> {
  // Get data for each index
  const promises = indexTickers.map(ticker => getIndexData(ticker, timeframe, fromDate, toDate));
  
  try {
    const results = await Promise.all(promises);
    
    // Map results to index tickers
    const indexData: Record<string, CandleData[]> = {};
    indexTickers.forEach((ticker, i) => {
      // Remove I: prefix for cleaner keys
      const cleanTicker = ticker.replace('I:', '');
      indexData[cleanTicker] = results[i] || [];
    });
    
    return indexData;
  } catch (error) {
    console.error('Error fetching batch index data:', error);
    return {};
  }
}

/**
 * Map timeframe string to Polygon parameters
 */
function mapTimeframeToParams(timeframe: string): { multiplier: number; timespan: string } {
  switch (timeframe) {
    case '1min':
      return { multiplier: 1, timespan: 'minute' };
    case '5min':
      return { multiplier: 5, timespan: 'minute' };
    case '15min':
      return { multiplier: 15, timespan: 'minute' };
    case '30min':
      return { multiplier: 30, timespan: 'minute' };
    case '1hour':
      return { multiplier: 1, timespan: 'hour' };
    case '4hour':
      return { multiplier: 4, timespan: 'hour' };
    case 'minute':
      return { multiplier: 1, timespan: 'minute' };
    case 'hour':
      return { multiplier: 1, timespan: 'hour' };
    case 'day':
    case '1D':
      return { multiplier: 1, timespan: 'day' };
    case 'week':
    case '1W':
      return { multiplier: 1, timespan: 'week' };
    case 'month':
    case '1M':
      return { multiplier: 1, timespan: 'month' };
    default:
      return { multiplier: 1, timespan: 'day' };
  }
}

// Export all the services
export default {
  getAggregates,
  getStockCandles,
  getIndexData,
  getBatchIndexData
};

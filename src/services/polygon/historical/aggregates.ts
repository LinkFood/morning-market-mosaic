
/**
 * Polygon.io Historical Aggregates Data
 * Provides aggregated market data
 */
import { polygonRequest } from '../client';
import { getCachedData, cacheData, CACHE_TTL } from '../cache';
import { CandleData } from '@/types/marketTypes';

/**
 * Get aggregated OHLCV data for a ticker
 * @param ticker Stock ticker symbol
 * @param multiplier The size of the timespan multiplier
 * @param timespan The timespan to get data for (day, hour, minute, etc.)
 * @param from Start date (YYYY-MM-DD)
 * @param to End date (YYYY-MM-DD)
 * @returns Promise with aggregated data
 */
export async function getAggregates(
  ticker: string,
  multiplier: number = 1,
  timespan: string = 'day',
  from: string,
  to: string
): Promise<CandleData[]> {
  const cacheKey = `aggs_${ticker}_${multiplier}_${timespan}_${from}_${to}`;
  const cachedData = getCachedData(cacheKey, CACHE_TTL.INDEX_DATA);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await polygonRequest(
      `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`
    );
    
    if (!response.results || !Array.isArray(response.results)) {
      console.warn(`Invalid response for ${ticker} aggregates:`, response);
      return [] as CandleData[];
    }
    
    // Format the data
    const formattedData = response.results.map((item: any) => ({
      date: new Date(item.t).toISOString().split('T')[0],
      timestamp: item.t,
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v,
      vwap: item.vw
    }));
    
    // Cache the result
    cacheData(cacheKey, formattedData);
    
    return formattedData;
  } catch (error) {
    console.error(`Error fetching aggregates for ${ticker}:`, error);
    return [] as CandleData[]; // Return empty array on error
  }
}

export default {
  getAggregates
};


/**
 * Polygon.io Historical Index Data
 * Provides access to historical stock index data
 */
import { polygonRequest } from '../client';
import { getCachedData, cacheData, CACHE_TTL } from '../cache';
import { CandleData } from '@/types/marketTypes';

/**
 * Get historical data for a stock index
 * @param indexTicker Index ticker symbol
 * @param multiplier The size of the timespan multiplier
 * @param timespan The timespan to get data for (day, hour, minute, etc.)
 * @param from Start date (YYYY-MM-DD)
 * @param to End date (YYYY-MM-DD)
 * @returns Promise with index data
 */
export async function getIndexData(
  indexTicker: string,
  multiplier: number = 1,
  timespan: string = 'day',
  from: string,
  to: string
): Promise<CandleData[]> {
  // Index tickers need to be prefixed with I: for Polygon
  const formattedTicker = indexTicker.startsWith('I:') ? indexTicker : `I:${indexTicker}`;
  
  const cacheKey = `index_${formattedTicker}_${multiplier}_${timespan}_${from}_${to}`;
  const cachedData = getCachedData(cacheKey, CACHE_TTL.INDEX_DATA);
  
  if (cachedData) {
    return cachedData as CandleData[];
  }
  
  try {
    console.log(`Fetching index data for ${formattedTicker}`);
    
    const response = await polygonRequest(
      `/v2/aggs/ticker/${formattedTicker}/range/${multiplier}/${timespan}/${from}/${to}`,
      { adjusted: 'true', sort: 'asc', limit: 5000 }
    );
    
    if (!response.results || !Array.isArray(response.results)) {
      console.warn(`Invalid response for ${formattedTicker} index data:`, response);
      return [] as CandleData[];
    }
    
    // Format the data
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
    
    return formattedData;
  } catch (error) {
    console.error(`Error fetching index data for ${indexTicker}:`, error);
    return [] as CandleData[];
  }
}

/**
 * Get batch index data for multiple indices
 * @param indexTickers Array of index ticker symbols
 * @param multiplier The size of the timespan multiplier
 * @param timespan The timespan to get data for (day, hour, minute, etc.)
 * @param from Start date (YYYY-MM-DD)
 * @param to End date (YYYY-MM-DD)
 * @returns Promise with object mapping tickers to data
 */
export async function getBatchIndexData(
  indexTickers: string[],
  multiplier: number = 1,
  timespan: string = 'day',
  from: string,
  to: string
): Promise<Record<string, CandleData[]>> {
  // Get data for each index
  const promises = indexTickers.map(ticker => 
    getIndexData(ticker, multiplier, timespan, from, to)
  );
  
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
    
    // Return empty data sets for all requested indices
    const emptyResults: Record<string, CandleData[]> = {};
    indexTickers.forEach(ticker => {
      const cleanTicker = ticker.replace('I:', '');
      emptyResults[cleanTicker] = [];
    });
    
    return emptyResults;
  }
}

export default {
  getIndexData,
  getBatchIndexData
};

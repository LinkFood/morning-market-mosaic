
/**
 * Polygon.io Historical Data Service
 * Provides time series and aggregated market data
 */
import { polygonRequest } from './client';
import { getCachedData, cacheData, CACHE_TTL } from './cache';
import { MarketIndex } from '@/types/marketTypes';

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

/**
 * Get aggregated data for a stock
 * @param ticker Stock ticker symbol
 * @param multiplier The size of the timespan multiplier
 * @param timespan The timespan to aggregate over
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
) {
  const cacheKey = `agg_${ticker}_${multiplier}_${timespan}_${from}_${to}`;
  const cachedData = getCachedData(cacheKey, CACHE_TTL.INDEX_DATA);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await polygonRequest(
      `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`
    );
    
    // Transform the response
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
    console.error(`Error fetching aggregates for ${ticker}:`, error);
    throw error;
  }
}

/**
 * Get data for market indices using ETF proxies
 * @param ticker Index ticker (can be "SPY" for S&P 500, "DIA" for Dow Jones, "QQQ" for Nasdaq)
 * @param days Number of days of historical data (default: 30)
 * @returns Promise with index data
 */
export async function getIndexData(ticker: string, days: number = 30): Promise<any> {
  const cacheKey = `index_${ticker}_${days}`;
  const cachedData = getCachedData(cacheKey, CACHE_TTL.INDEX_DATA);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    // Calculate date range
    const to = new Date().toISOString().split('T')[0];
    const from = new Date();
    from.setDate(from.getDate() - days);
    const fromDate = from.toISOString().split('T')[0];
    
    // Get historical data for the index
    const response = await polygonRequest(
      `/v2/aggs/ticker/${ticker}/range/1/day/${fromDate}/${to}`
    );
    
    // Get current day's data
    const currentData = await polygonRequest(
      `/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`
    );
    
    // Map index tickers to names
    const indexNames: Record<string, string> = {
      'SPY': 'S&P 500',
      'DIA': 'Dow Jones',
      'QQQ': 'Nasdaq',
      'IWM': 'Russell 2000',
      'EFA': 'MSCI EAFE',
      'EEM': 'MSCI Emerging Markets'
    };
    
    // Format index data
    const indexData: MarketIndex = {
      ticker,
      name: indexNames[ticker] || ticker,
      close: currentData.ticker.day.c,
      open: currentData.ticker.day.o,
      change: currentData.ticker.todaysChange,
      changePercent: currentData.ticker.todaysChangePerc
    };
    
    // Format historical data
    const historicalData = response.results.map((item: any) => ({
      date: new Date(item.t).toISOString().split('T')[0],
      close: item.c
    }));
    
    const result = {
      indexData,
      historicalData
    };
    
    // Cache the result
    cacheData(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error(`Error fetching index data for ${ticker}:`, error);
    throw error;
  }
}

/**
 * Get batch data for market indices
 * @param indices Array of index tickers
 * @returns Promise with array of index data
 */
export async function getBatchIndexData(indices: string[]): Promise<MarketIndex[]> {
  try {
    const promises = indices.map(ticker => {
      const cacheKey = `index_${ticker}_current`;
      const cachedData = getCachedData<MarketIndex>(cacheKey, CACHE_TTL.INDEX_DATA);
      
      if (cachedData) {
        return Promise.resolve(cachedData);
      }
      
      return polygonRequest(`/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`)
        .then(response => {
          // Map index tickers to names
          const indexNames: Record<string, string> = {
            'SPY': 'S&P 500',
            'DIA': 'Dow Jones',
            'QQQ': 'Nasdaq',
            'IWM': 'Russell 2000',
            'EFA': 'MSCI EAFE',
            'EEM': 'MSCI Emerging Markets'
          };
          
          const indexData: MarketIndex = {
            ticker,
            name: indexNames[ticker] || ticker,
            close: response.ticker.day.c,
            open: response.ticker.day.o,
            change: response.ticker.todaysChange,
            changePercent: response.ticker.todaysChangePerc
          };
          
          // Cache individual index data
          cacheData(`index_${ticker}_current`, indexData);
          
          return indexData;
        });
    });
    
    return Promise.all(promises);
  } catch (error) {
    console.error('Error fetching batch index data:', error);
    throw error;
  }
}

export default {
  getStockCandles,
  getAggregates,
  getIndexData,
  getBatchIndexData
};

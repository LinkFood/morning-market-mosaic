
/**
 * Polygon.io Market Breadth Service
 * Provides information about market breadth (advancers, decliners, etc.)
 */
import client from '../client';
import { getCachedData, cacheData, CACHE_TTL } from '../cache';
import { MarketBreadthData } from '@/types/marketTypes';

/**
 * Get market breadth data (advancers/decliners, new highs/lows)
 * @returns Promise with market breadth data
 */
export async function getMarketBreadth(): Promise<MarketBreadthData> {
  const cacheKey = 'market_breadth';
  const cachedData = getCachedData(cacheKey, CACHE_TTL.MARKET_STATUS);
  
  if (cachedData) {
    return cachedData as MarketBreadthData;
  }
  
  try {
    // For advancers/decliners
    const snapshotResponse = await client.get('/v2/snapshot/locale/us/markets/stocks/tickers');
    
    // For new highs/lows we would ideally use a dedicated endpoint
    // Since Polygon doesn't have a direct endpoint for this, we'll use:
    const highsResponse = await client.get('/v2/snapshot/locale/us/markets/stocks/gainers?limit=50');
    const lowsResponse = await client.get('/v2/snapshot/locale/us/markets/stocks/losers?limit=50');
    
    // Process the data
    let advancers = 0;
    let decliners = 0;
    let unchanged = 0;
    
    // Count advancers/decliners
    if (snapshotResponse.tickers) {
      snapshotResponse.tickers.forEach((ticker: any) => {
        if (ticker.todaysChange > 0) advancers++;
        else if (ticker.todaysChange < 0) decliners++;
        else unchanged++;
      });
    }
    
    // Count new highs/lows by filtering by daily percentage change
    // This is an approximation since we don't have direct 52-week high/low data
    const newHighs = highsResponse.tickers.filter((t: any) => t.todaysChangePerc > 5).length;
    const newLows = lowsResponse.tickers.filter((t: any) => t.todaysChangePerc < -5).length;
    
    const breadthData: MarketBreadthData = {
      advancers,
      decliners,
      unchanged,
      newHighs,
      newLows,
      timestamp: new Date().toISOString()
    };
    
    // Cache the result
    cacheData(cacheKey, breadthData);
    
    return breadthData;
  } catch (error) {
    console.error("Error fetching market breadth:", error);
    
    // Return default data if API fails
    return {
      advancers: 0,
      decliners: 0,
      unchanged: 0,
      newHighs: 0,
      newLows: 0,
      timestamp: new Date().toISOString()
    };
  }
}

export default {
  getMarketBreadth
};

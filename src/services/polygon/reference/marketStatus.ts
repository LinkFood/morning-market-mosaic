
/**
 * Polygon.io Market Status Service
 * Provides real-time market status information
 */
import { polygonRequest } from '../client';
import { getCachedData, cacheData, CACHE_TTL } from '../cache';

/**
 * Get current market status (open/closed)
 * @returns Promise with market status information
 */
export async function getMarketStatus() {
  const cacheKey = 'market_status';
  const cachedData = getCachedData(cacheKey, CACHE_TTL.MARKET_STATUS);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await polygonRequest('/v1/marketstatus/now');
    
    // Format the response
    const marketStatus = {
      market: response.market,
      serverTime: response.serverTime,
      exchanges: response.exchanges,
      isOpen: response.market === 'open',
      nextOpeningTime: null as string | null,
    };
    
    // If market is closed, get the next opening time
    if (!marketStatus.isOpen) {
      try {
        const calendarResponse = await polygonRequest('/v1/calendar/trading/next');
        marketStatus.nextOpeningTime = calendarResponse.open;
      } catch (e) {
        console.error("Error fetching next trading day:", e);
      }
    }
    
    // Cache the result
    cacheData(cacheKey, marketStatus);
    
    return marketStatus;
  } catch (error) {
    console.error("Error fetching market status:", error);
    throw error;
  }
}

export default {
  getMarketStatus
};

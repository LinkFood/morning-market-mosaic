
/**
 * Polygon.io Market Holidays Service
 * Provides information about market holidays
 */
import { polygonRequest } from '../client';
import { getCachedData, cacheData, CACHE_TTL } from '../cache';

/**
 * Get upcoming market holidays
 * @param year Optional year (defaults to current year)
 * @returns Promise with market holidays
 */
export async function getMarketHolidays(year?: number) {
  const currentYear = year || new Date().getFullYear();
  const cacheKey = `market_holidays_${currentYear}`;
  const cachedData = getCachedData(cacheKey, CACHE_TTL.MARKET_HOLIDAYS);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await polygonRequest(`/v1/marketstatus/upcoming`);
    
    // Filter for the requested year
    const holidays = response
      .filter((holiday: any) => new Date(holiday.date).getFullYear() === currentYear)
      .map((holiday: any) => ({
        name: holiday.name,
        date: holiday.date,
        status: holiday.status,
        exchange: holiday.exchange
      }));
    
    // Cache the result
    cacheData(cacheKey, holidays);
    
    return holidays;
  } catch (error) {
    console.error(`Error fetching market holidays for ${currentYear}:`, error);
    throw error;
  }
}

export default {
  getMarketHolidays
};
